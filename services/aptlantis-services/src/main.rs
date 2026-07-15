use std::{
    collections::{HashMap, HashSet},
    env, fs as stdfs,
    net::{SocketAddr, TcpStream},
    path::{Path, PathBuf},
    process,
    sync::{Arc, OnceLock},
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use anyhow::{anyhow, Context, Result};
use axum::{
    extract::{DefaultBodyLimit, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use tokio::{fs, net::TcpListener, process::Command, signal, time::timeout};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

const SERVICE_NAME: &str = "aptlantis-services";
const SERVICE_VERSION: &str = env!("CARGO_PKG_VERSION");
const SVG_LAB_MAX_BYTES: usize = 8 * 1024 * 1024;
const REQUEST_BODY_MAX_BYTES: usize = 12 * 1024 * 1024;
const SVG_LAB_TIMEOUT_MS: u64 = 10_000;

static SVG_ROOT_RE: OnceLock<Regex> = OnceLock::new();
static SVG_OPEN_RE: OnceLock<Regex> = OnceLock::new();
static SVG_ATTR_RE_CACHE: OnceLock<std::sync::Mutex<HashMap<String, Regex>>> = OnceLock::new();
static METADATA_RE: OnceLock<Regex> = OnceLock::new();
static SCRIPT_RE: OnceLock<Regex> = OnceLock::new();

#[derive(Clone)]
struct AppState {
    started_at: Instant,
    config: Arc<AppConfig>,
}

#[derive(Clone, Debug)]
struct AppConfig {
    bind: SocketAddr,
    data_root: PathBuf,
    command_schema_path: PathBuf,
    svg_asset_registry_path: PathBuf,
    sesm_root: PathBuf,
    sesm_validator: PathBuf,
    sesm_schema: PathBuf,
    sesm_python: String,
    svg_lab_timeout: Duration,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
    uptime_seconds: u64,
    services: Vec<ServiceDescriptor>,
}

#[derive(Serialize, Clone)]
struct ServiceDescriptor {
    id: &'static str,
    label: &'static str,
    status: &'static str,
    route: &'static str,
    description: &'static str,
}

#[derive(Debug)]
enum ApiError {
    BadRequest(String),
    PayloadTooLarge(String),
    NotFound(String),
    Internal(anyhow::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::BadRequest(message) => (StatusCode::BAD_REQUEST, message),
            ApiError::PayloadTooLarge(message) => (StatusCode::PAYLOAD_TOO_LARGE, message),
            ApiError::NotFound(message) => (StatusCode::NOT_FOUND, message),
            ApiError::Internal(error) => {
                warn!(error = %error, "request failed");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    error
                        .root_cause()
                        .to_string()
                        .trim()
                        .chars()
                        .take(240)
                        .collect(),
                )
            }
        };

        (
            status,
            Json(json!({ "success": false, "message": message })),
        )
            .into_response()
    }
}

impl From<anyhow::Error> for ApiError {
    fn from(error: anyhow::Error) -> Self {
        ApiError::Internal(error)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
struct SvgLabFinding {
    code: String,
    message: String,
    path: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgLabValidation {
    status: String,
    profile: String,
    errors: Vec<SvgLabFinding>,
    warnings: Vec<SvgLabFinding>,
    metadata_version: Option<String>,
    metadata: Option<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SvgTextRequest {
    svg_text: Value,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct SvgLabMetadataForm {
    asset_title: Option<String>,
    asset_role: Option<String>,
    project: Option<String>,
    author: Option<String>,
    license: Option<String>,
    tags: Option<String>,
    accessibility_summary: Option<String>,
    version: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SvgGenerateRequest {
    svg_text: Value,
    metadata: Option<SvgLabMetadataForm>,
}

#[derive(Deserialize)]
struct ValidatorJson {
    status: Option<String>,
    profile: Option<String>,
    errors: Option<Vec<SvgLabFinding>>,
    warnings: Option<Vec<SvgLabFinding>>,
    metadata_version: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgGenerateResponse {
    svg_text: String,
    metadata: Value,
    validation: SvgLabValidation,
    diff: SvgDiff,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgDiff {
    before_line_count: usize,
    after_line_count: usize,
    additions: usize,
    metadata_added: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgLabExample {
    id: &'static str,
    title: &'static str,
    description: &'static str,
    svg_text: String,
    expected_status: &'static str,
}

struct SvgLabExampleSource {
    id: &'static str,
    title: &'static str,
    description: &'static str,
    path: PathBuf,
    expected_status: &'static str,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct SvgAssetRegistry {
    #[serde(rename = "$schema", skip_serializing_if = "Option::is_none")]
    schema: Option<String>,
    id: String,
    title: String,
    version: String,
    last_updated: String,
    assets: Vec<SvgAssetRecord>,
}

impl Default for SvgAssetRegistry {
    fn default() -> Self {
        Self {
            schema: Some("/schemas/svg-asset-registry.schema.json".to_string()),
            id: "aptlantis-studio-svg-asset-registry".to_string(),
            title: "Aptlantis Studio SVG Asset Registry".to_string(),
            version: "0.1.0".to_string(),
            last_updated: "2026-07-15".to_string(),
            assets: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
struct SvgAssetRecord {
    #[serde(rename = "type")]
    record_type: String,
    asset_type: String,
    slug: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    title: Option<String>,
    source: SvgAssetSource,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    sesm: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    dimensions: Option<SvgDimensions>,
    #[serde(default)]
    roles: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    debug: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    ai: Option<Value>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
struct SvgAssetSource {
    format: String,
    path: String,
    #[serde(rename = "publicUrl", default, skip_serializing_if = "Option::is_none")]
    public_url: Option<String>,
    #[serde(
        rename = "content_hash",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    content_hash: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
struct SvgDimensions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    width: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    height: Option<String>,
    #[serde(rename = "viewBox", default, skip_serializing_if = "Option::is_none")]
    view_box: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct SvgAssetScanRequest {
    roots: Option<Vec<String>>,
    write_registry: Option<bool>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct SvgAssetEmbedRequest {
    slugs: Option<Vec<String>>,
    dry_run: Option<bool>,
    validate: Option<bool>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgAssetRegistryResponse {
    registry_path: String,
    registry: SvgAssetRegistry,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgAssetScanResponse {
    registry_path: String,
    scanned: usize,
    added: usize,
    updated: usize,
    wrote_registry: bool,
    registry: SvgAssetRegistry,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgAssetEmbedResponse {
    registry_path: String,
    dry_run: bool,
    requested: usize,
    embedded: usize,
    changed: usize,
    skipped: usize,
    wrote_assets: bool,
    results: Vec<SvgAssetEmbedResult>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SvgAssetEmbedResult {
    slug: String,
    path: String,
    status: String,
    changed: bool,
    message: Option<String>,
    validation: Option<SvgLabValidation>,
}

fn service_registry() -> Vec<ServiceDescriptor> {
    vec![
        ServiceDescriptor {
            id: "health",
            label: "Health",
            status: "ready",
            route: "/api/health",
            description:
                "Container and process readiness for Caddy, Cloudflared, and local checks.",
        },
        ServiceDescriptor {
            id: "command-builder",
            label: "Command Builder",
            status: "ready",
            route: "/api/command-builder/schemas",
            description: "Serves the schema catalog used by command-building interfaces.",
        },
        ServiceDescriptor {
            id: "svg-lab",
            label: "SVG Lab",
            status: "ready",
            route: "/api/svg-lab/*",
            description: "SESM validation, metadata generation, and fixture example services.",
        },
        ServiceDescriptor {
            id: "svg-assets",
            label: "SVG Asset Registry",
            status: "draft",
            route: "/api/svg-assets/*",
            description:
                "Public SVG registry scanning and explicit SESM metadata embedding services.",
        },
        ServiceDescriptor {
            id: "project-index",
            label: "Project Index",
            status: "planned",
            route: "/api/projects/*",
            description:
                "Future normalized project metadata, search, refresh, and evidence services.",
        },
    ]
}

fn config_from_env() -> Result<AppConfig> {
    let bind = env::var("APTLANTIS_BIND")
        .unwrap_or_else(|_| "0.0.0.0:8989".to_string())
        .parse::<SocketAddr>()
        .context("APTLANTIS_BIND must be a socket address such as 0.0.0.0:8989")?;

    let data_root = env::var("APTLANTIS_DATA_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/app/data"));

    let command_schema_path = env::var("APTLANTIS_COMMAND_SCHEMA_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            data_root
                .join("command-schemas")
                .join("command-schemas.json")
        });
    let svg_asset_registry_path = env::var("APTLANTIS_SVG_ASSET_REGISTRY")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            data_root
                .join("data")
                .join("svg-assets")
                .join("registry.json")
        });

    let sesm_root = env::var("APTLANTIS_SESM_ROOT")
        .or_else(|_| env::var("SESM_ROOT"))
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/app/sesm"));
    let sesm_validator = env::var("APTLANTIS_SESM_VALIDATOR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| sesm_root.join("Validate-SESM-Safe.py"));
    let sesm_schema = env::var("APTLANTIS_SESM_SCHEMA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| sesm_root.join("svg_asset.schema.json"));
    let sesm_python = env::var("APTLANTIS_SESM_PYTHON")
        .or_else(|_| env::var("SESM_PYTHON"))
        .unwrap_or_else(|_| "python3".to_string());
    let svg_lab_timeout = Duration::from_millis(
        env::var("APTLANTIS_SVG_LAB_TIMEOUT_MS")
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(SVG_LAB_TIMEOUT_MS),
    );

    Ok(AppConfig {
        bind,
        data_root,
        command_schema_path,
        svg_asset_registry_path,
        sesm_root,
        sesm_validator,
        sesm_schema,
        sesm_python,
        svg_lab_timeout,
    })
}

fn run_healthcheck() -> Result<()> {
    let config = config_from_env()?;
    let target = SocketAddr::from(([127, 0, 0, 1], config.bind.port()));
    TcpStream::connect_timeout(&target, Duration::from_secs(2))
        .with_context(|| format!("Failed to connect to service health port at {target}"))?;
    Ok(())
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        uptime_seconds: state.started_at.elapsed().as_secs(),
        services: service_registry(),
    })
}

async fn services() -> Json<Value> {
    Json(json!({
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "services": service_registry(),
    }))
}

async fn command_builder_schemas(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    if !state.config.command_schema_path.exists() {
        return Err(ApiError::NotFound(format!(
            "Command schema catalog was not found at {}.",
            state.config.command_schema_path.display()
        )));
    }

    let schema_text = fs::read_to_string(&state.config.command_schema_path)
        .await
        .with_context(|| {
            format!(
                "Failed to read {}",
                state.config.command_schema_path.display()
            )
        })?;
    let schema_json = serde_json::from_str::<Value>(&schema_text).with_context(|| {
        format!(
            "Failed to parse {}",
            state.config.command_schema_path.display()
        )
    })?;

    Ok(Json(schema_json))
}

fn assert_svg_lab_ready(config: &AppConfig) -> Result<(), ApiError> {
    if !config.sesm_validator.exists() {
        return Err(ApiError::Internal(anyhow!(
            "SESM validator was not found at {}.",
            config.sesm_validator.display()
        )));
    }
    if !config.sesm_schema.exists() {
        return Err(ApiError::Internal(anyhow!(
            "SESM SVG schema was not found at {}.",
            config.sesm_schema.display()
        )));
    }
    Ok(())
}

fn assert_svg_text(svg_text: &Value) -> Result<String, ApiError> {
    let Some(svg_text) = svg_text.as_str() else {
        return Err(ApiError::BadRequest("svgText is required.".to_string()));
    };
    if svg_text.trim().is_empty() {
        return Err(ApiError::BadRequest("svgText is required.".to_string()));
    }
    if svg_text.as_bytes().len() > SVG_LAB_MAX_BYTES {
        return Err(ApiError::PayloadTooLarge(format!(
            "SVG exceeds the {SVG_LAB_MAX_BYTES} byte SVG Lab limit."
        )));
    }
    if !svg_root_re().is_match(svg_text) {
        return Err(ApiError::BadRequest(
            "Input must contain an <svg> root element.".to_string(),
        ));
    }
    Ok(svg_text.to_string())
}

fn svg_root_re() -> &'static Regex {
    SVG_ROOT_RE.get_or_init(|| Regex::new(r"(?i)<svg[\s>]").expect("valid svg root regex"))
}

fn metadata_re() -> &'static Regex {
    METADATA_RE.get_or_init(|| {
        Regex::new(r#"(?is)<metadata\b([^>]*)>(.*?)</metadata>\s*"#).expect("valid metadata regex")
    })
}

fn script_re() -> &'static Regex {
    SCRIPT_RE.get_or_init(|| {
        Regex::new(r"(?is)<script\b[^>]*>(.*?)</script>").expect("valid script regex")
    })
}

fn strip_cdata(value: &str) -> String {
    let trimmed = value.trim();
    let without_prefix = trimmed.strip_prefix("<![CDATA[").unwrap_or(trimmed);
    without_prefix
        .strip_suffix("]]>")
        .unwrap_or(without_prefix)
        .trim()
        .to_string()
}

fn metadata_attrs_have_sesm_id(attrs: &str) -> bool {
    let lower = attrs.to_ascii_lowercase();
    lower.contains("id=\"sesm\"") || lower.contains("id='sesm'")
}

fn extract_sesm_metadata(svg_text: &str) -> Option<Value> {
    let captures = metadata_re().captures_iter(svg_text).find(|captures| {
        metadata_attrs_have_sesm_id(
            captures
                .get(1)
                .map(|value| value.as_str())
                .unwrap_or_default(),
        )
    })?;
    let metadata_body = captures.get(2)?.as_str();
    let unwrapped_script = script_re().replace(metadata_body, "$1");
    let raw_metadata = strip_cdata(&unwrapped_script);
    let parsed = serde_json::from_str::<Value>(&raw_metadata).ok()?;
    if parsed.is_object() {
        Some(parsed)
    } else {
        None
    }
}

fn normalize_tags(tags: Option<&str>) -> Vec<String> {
    tags.unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|tag| !tag.is_empty())
        .map(ToString::to_string)
        .collect()
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();
    let mut last_dash = false;

    for ch in value.chars().flat_map(char::to_lowercase) {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch);
            last_dash = false;
        } else if !last_dash && !slug.is_empty() {
            slug.push('-');
            last_dash = true;
        }
    }

    slug.trim_matches('-').to_string()
}

fn compact_string(value: Option<&String>, fallback: &str) -> String {
    value
        .map(|text| text.trim())
        .filter(|text| !text.is_empty())
        .unwrap_or(fallback)
        .to_string()
}

fn unix_timestamp_string() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string()
}

fn build_sesm_metadata(metadata: SvgLabMetadataForm) -> Value {
    let title = compact_string(metadata.asset_title.as_ref(), "Untitled SVG Asset");
    let raw_role = compact_string(metadata.asset_role.as_ref(), "logo");
    let role = if raw_role == "brand-mark" {
        "logo".to_string()
    } else {
        raw_role
    };
    let project = compact_string(metadata.project.as_ref(), "Aptlantis Studio");
    let author = compact_string(metadata.author.as_ref(), "Aptlantis");
    let license = compact_string(metadata.license.as_ref(), "CC0-1.0");
    let version = compact_string(metadata.version.as_ref(), "1.0.0");
    let accessibility_summary = compact_string(
        metadata.accessibility_summary.as_ref(),
        "No accessibility summary supplied.",
    );
    let tags = normalize_tags(metadata.tags.as_deref());
    let asset_id = {
        let slug = slugify(&title);
        if slug.is_empty() {
            "svg-lab-asset".to_string()
        } else {
            slug
        }
    };

    json!({
        "sesm_version": "0.3.0",
        "asset": {
            "id": asset_id,
            "role": role,
            "title": title,
            "ecosystem": project,
            "tags": tags,
        },
        "accessibility": {
            "summary": accessibility_summary,
        },
        "provenance": {
            "generated": true,
            "generator": {
                "name": "aptlantis-svg-lab",
                "version": version,
                "language": "rust",
            },
            "author": author,
            "license": license,
            "generated_at": unix_timestamp_string(),
        },
    })
}

fn escape_cdata(value: &str) -> String {
    value.replace("]]>", "]]]]><![CDATA[>")
}

fn remove_existing_sesm(svg_text: &str) -> String {
    metadata_re()
        .replace_all(svg_text, |captures: &regex::Captures<'_>| {
            let attrs = captures
                .get(1)
                .map(|value| value.as_str())
                .unwrap_or_default();
            if metadata_attrs_have_sesm_id(attrs) {
                String::new()
            } else {
                captures
                    .get(0)
                    .map(|value| value.as_str())
                    .unwrap_or_default()
                    .to_string()
            }
        })
        .to_string()
}

fn embed_sesm_metadata(svg_text: &str, metadata: &Value) -> Result<String, ApiError> {
    let clean_svg = remove_existing_sesm(svg_text);
    let metadata_json = serde_json::to_string_pretty(metadata)
        .map_err(|error| ApiError::Internal(anyhow!(error)))?;
    let metadata_block = format!(
        "<metadata id=\"sesm\"><![CDATA[\n{}\n]]></metadata>\n",
        escape_cdata(&metadata_json)
    );
    let svg_open = Regex::new(r"(?is)<svg\b([^>]*)>").expect("valid svg open regex");

    if !svg_open.is_match(&clean_svg) {
        return Err(ApiError::BadRequest(
            "Input must contain an <svg> root element.".to_string(),
        ));
    }

    Ok(svg_open
        .replacen(&clean_svg, 1, format!("<svg$1>\n{metadata_block}"))
        .to_string())
}

async fn run_validator(config: &AppConfig, svg_path: &Path) -> Result<ValidatorJson, ApiError> {
    let output_future = Command::new(&config.sesm_python)
        .arg(&config.sesm_validator)
        .arg(svg_path)
        .arg("--schema")
        .arg(&config.sesm_schema)
        .arg("--safe-profile")
        .arg("--json")
        .current_dir(&config.sesm_root)
        .output();

    let output = timeout(config.svg_lab_timeout, output_future)
        .await
        .map_err(|_| ApiError::BadRequest("SESM validation timed out.".to_string()))?
        .with_context(|| format!("Failed to run {}", config.sesm_python))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    if let Ok(parsed) = serde_json::from_str::<ValidatorJson>(&stdout) {
        return Ok(parsed);
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    let message = if stderr.trim().is_empty() {
        stdout.trim().to_string()
    } else {
        stderr.trim().to_string()
    };
    Err(ApiError::BadRequest(if message.is_empty() {
        "SESM validator did not return JSON.".to_string()
    } else {
        message
    }))
}

async fn validate_svg_text(
    config: &AppConfig,
    svg_text: &str,
) -> Result<SvgLabValidation, ApiError> {
    assert_svg_lab_ready(config)?;

    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let temp_dir = env::temp_dir().join(format!("svg-lab-{}-{unique}", process::id()));
    let svg_path = temp_dir.join("input.svg");

    fs::create_dir_all(&temp_dir)
        .await
        .with_context(|| format!("Failed to create {}", temp_dir.display()))?;
    fs::write(&svg_path, svg_text)
        .await
        .with_context(|| format!("Failed to write {}", svg_path.display()))?;

    let validation = async {
        let result = run_validator(config, &svg_path).await?;
        Ok::<SvgLabValidation, ApiError>(SvgLabValidation {
            status: result.status.unwrap_or_else(|| "error".to_string()),
            profile: result
                .profile
                .unwrap_or_else(|| "sesm-unverified".to_string()),
            errors: result.errors.unwrap_or_default(),
            warnings: result.warnings.unwrap_or_default(),
            metadata_version: result.metadata_version,
            metadata: extract_sesm_metadata(svg_text),
        })
    }
    .await;

    let _ = fs::remove_dir_all(&temp_dir).await;
    validation
}

fn make_diff(before: &str, after: &str) -> SvgDiff {
    let before_line_count = before.lines().count();
    let after_line_count = after.lines().count();
    SvgDiff {
        before_line_count,
        after_line_count,
        additions: after_line_count.saturating_sub(before_line_count),
        metadata_added: extract_sesm_metadata(before).is_none()
            && extract_sesm_metadata(after).is_some(),
    }
}

async fn svg_lab_validate(
    State(state): State<AppState>,
    Json(payload): Json<SvgTextRequest>,
) -> Result<Json<SvgLabValidation>, ApiError> {
    let svg_text = assert_svg_text(&payload.svg_text)?;
    let validation = validate_svg_text(&state.config, &svg_text).await?;
    Ok(Json(validation))
}

async fn svg_lab_generate(
    State(state): State<AppState>,
    Json(payload): Json<SvgGenerateRequest>,
) -> Result<Json<SvgGenerateResponse>, ApiError> {
    let svg_text = assert_svg_text(&payload.svg_text)?;
    let metadata = build_sesm_metadata(payload.metadata.unwrap_or_default());
    let generated_svg = embed_sesm_metadata(&svg_text, &metadata)?;
    let validation = validate_svg_text(&state.config, &generated_svg).await?;

    Ok(Json(SvgGenerateResponse {
        diff: make_diff(&svg_text, &generated_svg),
        svg_text: generated_svg,
        metadata,
        validation,
    }))
}

fn svg_lab_examples(config: &AppConfig) -> Vec<SvgLabExampleSource> {
    vec![
        SvgLabExampleSource {
            id: "basic-safe",
            title: "Basic safe SESM SVG",
            description: "Minimal valid fixture with an embedded SESM metadata block.",
            path: config.sesm_root.join("fixtures/valid/basic-safe.svg"),
            expected_status: "ok",
        },
        SvgLabExampleSource {
            id: "full-metadata",
            title: "Full SESM metadata",
            description: "Fixture showing a richer SESM metadata object.",
            path: config.sesm_root.join("fixtures/valid/full-metadata.svg"),
            expected_status: "ok",
        },
        SvgLabExampleSource {
            id: "script-blocked",
            title: "Unsafe script example",
            description: "Invalid fixture used to demonstrate safe-profile blocking.",
            path: config.sesm_root.join("fixtures/invalid/script.svg"),
            expected_status: "error",
        },
        SvgLabExampleSource {
            id: "remote-reference",
            title: "Remote reference warning",
            description: "Warning fixture for external references that need review.",
            path: config
                .sesm_root
                .join("fixtures/warning/remote-reference.svg"),
            expected_status: "warning",
        },
    ]
}

fn svg_open_re() -> &'static Regex {
    SVG_OPEN_RE.get_or_init(|| Regex::new(r"(?is)<svg\b([^>]*)>").expect("valid svg open regex"))
}

fn attr_re(name: &str) -> Regex {
    let cache = SVG_ATTR_RE_CACHE.get_or_init(|| std::sync::Mutex::new(HashMap::new()));
    let mut cache = cache.lock().expect("svg attr regex cache lock");
    if let Some(regex) = cache.get(name) {
        return regex.clone();
    }

    let regex = Regex::new(&format!(
        r#"(?i)\b{}\s*=\s*["']([^"']+)["']"#,
        regex::escape(name)
    ))
    .expect("valid svg attr regex");
    cache.insert(name.to_string(), regex.clone());
    regex
}

fn extract_attr(attrs: &str, name: &str) -> Option<String> {
    attr_re(name)
        .captures(attrs)
        .and_then(|captures| captures.get(1))
        .map(|value| value.as_str().trim().to_string())
        .filter(|value| !value.is_empty())
}

fn extract_svg_dimensions(svg_text: &str) -> Option<SvgDimensions> {
    let attrs = svg_open_re().captures(svg_text)?.get(1)?.as_str();
    let dimensions = SvgDimensions {
        width: extract_attr(attrs, "width"),
        height: extract_attr(attrs, "height"),
        view_box: extract_attr(attrs, "viewBox"),
    };

    if dimensions.width.is_none() && dimensions.height.is_none() && dimensions.view_box.is_none() {
        None
    } else {
        Some(dimensions)
    }
}

fn public_path_to_fs(config: &AppConfig, public_path: &str) -> Result<PathBuf, ApiError> {
    let trimmed = public_path.trim();
    if trimmed.is_empty() {
        return Err(ApiError::BadRequest("Public path is required.".to_string()));
    }

    let relative = trimmed.trim_start_matches('/');
    let relative_path = Path::new(relative);
    if relative_path.is_absolute()
        || relative_path
            .components()
            .any(|component| matches!(component, std::path::Component::ParentDir))
    {
        return Err(ApiError::BadRequest(format!(
            "Public path {trimmed} must stay inside the configured data root."
        )));
    }

    Ok(config.data_root.join(relative_path))
}

fn path_to_public_path(config: &AppConfig, file_path: &Path) -> Result<String, ApiError> {
    let relative = file_path.strip_prefix(&config.data_root).with_context(|| {
        format!(
            "{} is not inside {}",
            file_path.display(),
            config.data_root.display()
        )
    })?;
    let relative = relative.to_string_lossy().replace('\\', "/");
    Ok(format!("/{relative}"))
}

fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    format!("sha256:{digest:x}")
}

fn collect_svg_files(root: &Path, files: &mut Vec<PathBuf>) -> Result<(), ApiError> {
    if !root.exists() {
        return Ok(());
    }

    for entry in
        stdfs::read_dir(root).with_context(|| format!("Failed to read {}", root.display()))?
    {
        let entry = entry.with_context(|| format!("Failed to read entry in {}", root.display()))?;
        let path = entry.path();
        if path.is_dir() {
            collect_svg_files(&path, files)?;
        } else if path
            .extension()
            .and_then(|extension| extension.to_str())
            .map(|extension| extension.eq_ignore_ascii_case("svg"))
            .unwrap_or(false)
        {
            files.push(path);
        }
    }

    Ok(())
}

fn infer_svg_roles(public_path: &str) -> Vec<String> {
    let lower = public_path.to_ascii_lowercase();
    let mut roles = Vec::new();

    if lower.contains("/logos/") || lower.contains("logo") {
        roles.push("logo".to_string());
        roles.push("branding".to_string());
    }
    if lower.contains("favicon") || lower.contains("icon") {
        roles.push("icon".to_string());
    }
    if lower.contains("hero") {
        roles.push("illustration".to_string());
        roles.push("branding".to_string());
    }
    if roles.is_empty() {
        roles.push("other".to_string());
    }

    let mut seen = HashSet::new();
    roles
        .into_iter()
        .filter(|role| seen.insert(role.clone()))
        .collect()
}

fn display_title_from_slug(slug: &str) -> String {
    slug.split('-')
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut chars = part.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn normalize_asset_record(mut record: SvgAssetRecord) -> SvgAssetRecord {
    record.record_type = if record.record_type.trim().is_empty() {
        "asset".to_string()
    } else {
        record.record_type
    };
    record.asset_type = if record.asset_type.trim().is_empty() {
        "svg".to_string()
    } else {
        record.asset_type
    };
    record.source.format = if record.source.format.trim().is_empty() {
        "svg".to_string()
    } else {
        record.source.format
    };
    if record.source.public_url.is_none() {
        record.source.public_url = Some(record.source.path.clone());
    }
    if record.title.is_none() {
        record.title = Some(display_title_from_slug(&record.slug));
    }
    if record.roles.is_empty() {
        record.roles = infer_svg_roles(&record.source.path);
    }
    record
}

async fn read_svg_asset_registry(config: &AppConfig) -> Result<SvgAssetRegistry, ApiError> {
    if !config.svg_asset_registry_path.exists() {
        return Ok(SvgAssetRegistry::default());
    }

    let registry_text = fs::read_to_string(&config.svg_asset_registry_path)
        .await
        .with_context(|| {
            format!(
                "Failed to read {}",
                config.svg_asset_registry_path.display()
            )
        })?;
    let mut registry =
        serde_json::from_str::<SvgAssetRegistry>(&registry_text).with_context(|| {
            format!(
                "Failed to parse {}",
                config.svg_asset_registry_path.display()
            )
        })?;
    registry.assets = registry
        .assets
        .into_iter()
        .map(normalize_asset_record)
        .collect();
    Ok(registry)
}

async fn write_svg_asset_registry(
    config: &AppConfig,
    registry: &SvgAssetRegistry,
) -> Result<(), ApiError> {
    if let Some(parent) = config.svg_asset_registry_path.parent() {
        fs::create_dir_all(parent)
            .await
            .with_context(|| format!("Failed to create {}", parent.display()))?;
    }
    let registry_text = serde_json::to_string_pretty(registry)
        .map_err(|error| ApiError::Internal(anyhow!(error)))?;
    fs::write(&config.svg_asset_registry_path, registry_text)
        .await
        .with_context(|| {
            format!(
                "Failed to write {}",
                config.svg_asset_registry_path.display()
            )
        })?;
    Ok(())
}

fn build_asset_record_from_svg(
    config: &AppConfig,
    file_path: &Path,
) -> Result<SvgAssetRecord, ApiError> {
    let svg_bytes = stdfs::read(file_path)
        .with_context(|| format!("Failed to read {}", file_path.display()))?;
    let svg_text = String::from_utf8_lossy(&svg_bytes);
    let public_path = path_to_public_path(config, file_path)?;
    let slug = file_path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .map(slugify)
        .filter(|slug| !slug.is_empty())
        .ok_or_else(|| ApiError::BadRequest(format!("Could not derive slug for {public_path}")))?;
    let existing_metadata = extract_sesm_metadata(&svg_text);
    let title = existing_metadata
        .as_ref()
        .and_then(|metadata| metadata.pointer("/asset/title"))
        .and_then(Value::as_str)
        .map(ToString::to_string)
        .unwrap_or_else(|| display_title_from_slug(&slug));

    Ok(normalize_asset_record(SvgAssetRecord {
        record_type: "asset".to_string(),
        asset_type: "svg".to_string(),
        slug,
        title: Some(title),
        source: SvgAssetSource {
            format: "svg".to_string(),
            path: public_path.clone(),
            public_url: Some(public_path.clone()),
            content_hash: Some(sha256_hex(&svg_bytes)),
        },
        sesm: existing_metadata,
        dimensions: extract_svg_dimensions(&svg_text),
        roles: infer_svg_roles(&public_path),
        debug: Some(json!({
            "imported_by": "aptlantis-services/svg-assets-scan",
            "imported_at": unix_timestamp_string(),
        })),
        ai: None,
    }))
}

fn asset_metadata(record: &SvgAssetRecord) -> Value {
    if let Some(metadata) = &record.sesm {
        return metadata.clone();
    }

    let title = record
        .title
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(&record.slug);
    let role = record.roles.first().map(String::as_str).unwrap_or("logo");
    let summary = record
        .ai
        .as_ref()
        .and_then(|ai| ai.get("summary"))
        .and_then(Value::as_str)
        .unwrap_or(title);

    json!({
        "sesm_version": "0.3.0",
        "asset": {
            "id": record.slug,
            "role": role,
            "title": title,
            "ecosystem": "Aptlantis Studio",
            "tags": record.roles,
        },
        "accessibility": {
            "summary": summary,
        },
        "provenance": {
            "generated": false,
            "generator": {
                "name": "aptlantis-svg-asset-registry",
                "version": SERVICE_VERSION,
                "language": "rust",
            },
            "author": "Aptlantis",
            "license": "Site content license pending",
            "source": record.source.path,
            "generated_at": unix_timestamp_string(),
        },
    })
}

async fn svg_lab_example_list(
    State(state): State<AppState>,
) -> Result<Json<Vec<SvgLabExample>>, ApiError> {
    assert_svg_lab_ready(&state.config)?;
    let mut examples = Vec::new();

    for example in svg_lab_examples(&state.config) {
        let svg_text = fs::read_to_string(&example.path)
            .await
            .with_context(|| format!("Failed to read {}", example.path.display()))?;
        examples.push(SvgLabExample {
            id: example.id,
            title: example.title,
            description: example.description,
            svg_text,
            expected_status: example.expected_status,
        });
    }

    Ok(Json(examples))
}

async fn svg_asset_registry(
    State(state): State<AppState>,
) -> Result<Json<SvgAssetRegistryResponse>, ApiError> {
    let registry = read_svg_asset_registry(&state.config).await?;
    Ok(Json(SvgAssetRegistryResponse {
        registry_path: state.config.svg_asset_registry_path.display().to_string(),
        registry,
    }))
}

async fn svg_asset_scan(
    State(state): State<AppState>,
    Json(payload): Json<SvgAssetScanRequest>,
) -> Result<Json<SvgAssetScanResponse>, ApiError> {
    let mut registry = read_svg_asset_registry(&state.config).await?;
    let roots = payload.roots.unwrap_or_else(|| vec!["/logos".to_string()]);
    let write_registry = payload.write_registry.unwrap_or(true);
    let mut svg_files = Vec::new();

    for root in roots {
        let root_path = public_path_to_fs(&state.config, &root)?;
        collect_svg_files(&root_path, &mut svg_files)?;
    }

    svg_files.sort();

    let mut added = 0usize;
    let mut updated = 0usize;
    for file_path in &svg_files {
        let scanned = build_asset_record_from_svg(&state.config, file_path)?;
        if let Some(existing) = registry
            .assets
            .iter_mut()
            .find(|asset| asset.slug == scanned.slug || asset.source.path == scanned.source.path)
        {
            existing.source = scanned.source;
            existing.dimensions = scanned.dimensions;
            if existing.title.is_none() {
                existing.title = scanned.title;
            }
            if existing.roles.is_empty() {
                existing.roles = scanned.roles;
            }
            if scanned.sesm.is_some() {
                existing.sesm = scanned.sesm;
            }
            updated += 1;
        } else {
            registry.assets.push(scanned);
            added += 1;
        }
    }

    registry
        .assets
        .sort_by(|left, right| left.slug.cmp(&right.slug));
    registry.last_updated = "2026-07-15".to_string();

    if write_registry {
        write_svg_asset_registry(&state.config, &registry).await?;
    }

    Ok(Json(SvgAssetScanResponse {
        registry_path: state.config.svg_asset_registry_path.display().to_string(),
        scanned: svg_files.len(),
        added,
        updated,
        wrote_registry: write_registry,
        registry,
    }))
}

async fn svg_asset_embed(
    State(state): State<AppState>,
    Json(payload): Json<SvgAssetEmbedRequest>,
) -> Result<Json<SvgAssetEmbedResponse>, ApiError> {
    let mut registry = read_svg_asset_registry(&state.config).await?;
    let dry_run = payload.dry_run.unwrap_or(true);
    let validate = payload.validate.unwrap_or(false);
    let selected_slugs = payload
        .slugs
        .map(|slugs| slugs.into_iter().collect::<HashSet<_>>());
    let requested = selected_slugs
        .as_ref()
        .map(HashSet::len)
        .unwrap_or_else(|| registry.assets.len());
    let mut results = Vec::new();
    let mut embedded = 0usize;
    let mut changed = 0usize;
    let mut skipped = 0usize;

    for record in &mut registry.assets {
        if let Some(slugs) = &selected_slugs {
            if !slugs.contains(&record.slug) {
                continue;
            }
        }

        let file_path = public_path_to_fs(&state.config, &record.source.path)?;
        if !file_path.exists() {
            skipped += 1;
            results.push(SvgAssetEmbedResult {
                slug: record.slug.clone(),
                path: record.source.path.clone(),
                status: "missing".to_string(),
                changed: false,
                message: Some(format!("SVG file was not found at {}", file_path.display())),
                validation: None,
            });
            continue;
        }

        let svg_text = fs::read_to_string(&file_path)
            .await
            .with_context(|| format!("Failed to read {}", file_path.display()))?;
        let metadata = asset_metadata(record);
        let generated_svg = embed_sesm_metadata(&svg_text, &metadata)?;
        let asset_changed = generated_svg != svg_text;
        let validation = if validate {
            Some(validate_svg_text(&state.config, &generated_svg).await?)
        } else {
            None
        };

        if asset_changed {
            changed += 1;
        }

        if asset_changed && !dry_run {
            fs::write(&file_path, &generated_svg)
                .await
                .with_context(|| format!("Failed to write {}", file_path.display()))?;
            record.source.content_hash = Some(sha256_hex(generated_svg.as_bytes()));
            record.sesm = Some(metadata);
            record.dimensions = extract_svg_dimensions(&generated_svg);
            embedded += 1;
        } else if !asset_changed {
            skipped += 1;
        }

        results.push(SvgAssetEmbedResult {
            slug: record.slug.clone(),
            path: record.source.path.clone(),
            status: if dry_run {
                "dry-run".to_string()
            } else if asset_changed {
                "embedded".to_string()
            } else {
                "unchanged".to_string()
            },
            changed: asset_changed,
            message: None,
            validation,
        });
    }

    if !dry_run {
        registry.last_updated = "2026-07-15".to_string();
        write_svg_asset_registry(&state.config, &registry).await?;
    }

    Ok(Json(SvgAssetEmbedResponse {
        registry_path: state.config.svg_asset_registry_path.display().to_string(),
        dry_run,
        requested,
        embedded,
        changed,
        skipped,
        wrote_assets: !dry_run,
        results,
    }))
}

fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(health))
        .route("/api/services", get(services))
        .route("/api/command-builder/schemas", get(command_builder_schemas))
        .route("/api/svg-lab/validate", post(svg_lab_validate))
        .route("/api/svg-lab/generate", post(svg_lab_generate))
        .route("/api/svg-lab/examples", get(svg_lab_example_list))
        .route("/api/svg-assets/registry", get(svg_asset_registry))
        .route("/api/svg-assets/scan", post(svg_asset_scan))
        .route("/api/svg-assets/embed", post(svg_asset_embed))
        .layer(DefaultBodyLimit::max(REQUEST_BODY_MAX_BYTES))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

#[tokio::main]
async fn main() -> Result<()> {
    if env::args().any(|argument| argument == "--healthcheck") {
        return run_healthcheck();
    }

    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "aptlantis_services=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Arc::new(config_from_env()?);
    let state = AppState {
        started_at: Instant::now(),
        config: Arc::clone(&config),
    };
    let app = build_router(state);
    let listener = TcpListener::bind(config.bind).await?;

    info!(
        service = SERVICE_NAME,
        version = SERVICE_VERSION,
        bind = %config.bind,
        data_root = %config.data_root.display(),
        command_schema_path = %config.command_schema_path.display(),
        svg_asset_registry_path = %config.svg_asset_registry_path.display(),
        sesm_root = %config.sesm_root.display(),
        sesm_validator = %config.sesm_validator.display(),
        sesm_schema = %config.sesm_schema.display(),
        "starting Aptlantis service host"
    );

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install terminate handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
        _ = tokio::time::sleep(Duration::from_secs(u64::MAX)) => {},
    }

    info!("shutdown signal received");
}
