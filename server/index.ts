import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtppro.zoho.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_FROM =
  process.env.EMAIL_FROM || process.env.EMAIL_USER || "contact@aptlantis.net";
const EMAIL_TO = process.env.EMAIL_TO || "root@aptlantis.net";
const EMAIL_USER = process.env.EMAIL_USER || EMAIL_FROM;
const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS || 15_000);
const SESM_ROOT = process.env.SESM_ROOT || "D:\\.library\\aptlantis_core\\SESM";
const SESM_VALIDATOR = join(SESM_ROOT, "Validate-SESM-Safe.py");
const SESM_SCHEMA = join(SESM_ROOT, "svg_asset.schema.json");
const PYTHON_BIN = process.env.SESM_PYTHON || "python";
const SVG_LAB_MAX_BYTES = 8 * 1024 * 1024;
const SVG_LAB_TIMEOUT_MS = 10_000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "12mb" }));

type SvgLabFinding = {
  code: string;
  message: string;
  path?: string;
};

type SvgLabValidation = {
  status: string;
  profile: string;
  errors: SvgLabFinding[];
  warnings: SvgLabFinding[];
  metadataVersion: string | null;
  metadata: Record<string, unknown> | null;
};

type SvgLabMetadataForm = {
  assetTitle?: string;
  assetRole?: string;
  project?: string;
  author?: string;
  license?: string;
  tags?: string;
  accessibilitySummary?: string;
  version?: string;
};

type ValidatorJson = {
  status?: string;
  profile?: string;
  errors?: SvgLabFinding[];
  warnings?: SvgLabFinding[];
  metadata_version?: string | null;
};

const svgLabExamples = [
  {
    id: "basic-safe",
    title: "Basic safe SESM SVG",
    description: "Minimal valid fixture with an embedded SESM metadata block.",
    file: join(SESM_ROOT, "fixtures", "valid", "basic-safe.svg"),
    expectedStatus: "ok",
  },
  {
    id: "full-metadata",
    title: "Full SESM metadata",
    description: "Fixture showing a richer SESM metadata object.",
    file: join(SESM_ROOT, "fixtures", "valid", "full-metadata.svg"),
    expectedStatus: "ok",
  },
  {
    id: "script-blocked",
    title: "Unsafe script example",
    description: "Invalid fixture used to demonstrate safe-profile blocking.",
    file: join(SESM_ROOT, "fixtures", "invalid", "script.svg"),
    expectedStatus: "error",
  },
  {
    id: "remote-reference",
    title: "Remote reference warning",
    description: "Warning fixture for external references that need review.",
    file: join(SESM_ROOT, "fixtures", "warning", "remote-reference.svg"),
    expectedStatus: "warning",
  },
];

const assertSvgLabReady = () => {
  if (!existsSync(SESM_VALIDATOR)) {
    throw new Error(`SESM validator was not found at ${SESM_VALIDATOR}`);
  }
};

const assertSvgText = (svgText: unknown): string => {
  if (typeof svgText !== "string" || !svgText.trim()) {
    throw new Error("svgText is required.");
  }
  const byteLength = Buffer.byteLength(svgText, "utf8");
  if (byteLength > SVG_LAB_MAX_BYTES) {
    throw new Error(`SVG exceeds the ${SVG_LAB_MAX_BYTES} byte SVG Lab limit.`);
  }
  if (!/<svg[\s>]/i.test(svgText)) {
    throw new Error("Input must contain an <svg> root element.");
  }
  return svgText;
};

const stripCdata = (value: string) =>
  value
    .trim()
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();

const extractSesmMetadata = (
  svgText: string,
): Record<string, unknown> | null => {
  const metadataMatch = svgText.match(
    /<metadata\b(?=[^>]*\bid=["']sesm["'])[^>]*>([\s\S]*?)<\/metadata>/i,
  );
  if (!metadataMatch) return null;

  const rawMetadata = stripCdata(
    metadataMatch[1].replace(/<script\b[^>]*>([\s\S]*?)<\/script>/i, "$1"),
  );
  try {
    const parsed = JSON.parse(rawMetadata);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const normalizeTags = (tags?: string) =>
  (tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildSesmMetadata = (
  metadata: SvgLabMetadataForm,
): Record<string, unknown> => {
  const title = metadata.assetTitle?.trim() || "Untitled SVG Asset";
  const rawRole = metadata.assetRole?.trim() || "logo";
  const role = rawRole === "brand-mark" ? "logo" : rawRole;
  const project = metadata.project?.trim() || "Aptlantis Studio";
  const author = metadata.author?.trim() || "Aptlantis";
  const license = metadata.license?.trim() || "CC0-1.0";
  const version = metadata.version?.trim() || "1.0.0";
  const accessibilitySummary =
    metadata.accessibilitySummary?.trim() ||
    "No accessibility summary supplied.";
  const tags = normalizeTags(metadata.tags);

  return {
    sesm_version: "0.3.0",
    asset: {
      id:
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "svg-lab-asset",
      role,
      title,
      ecosystem: project,
      tags,
    },
    accessibility: {
      summary: accessibilitySummary,
    },
    provenance: {
      generated: true,
      generator: {
        name: "aptlantis-svg-lab",
        version,
        language: "typescript",
      },
      author,
      license,
      generated_at: new Date().toISOString(),
    },
  };
};

const escapeCdata = (value: string) =>
  value.replace(/\]\]>/g, "]]]]><![CDATA[>");

const removeExistingSesm = (svgText: string) =>
  svgText.replace(
    /<metadata\b(?=[^>]*\bid=["']sesm["'])[^>]*>[\s\S]*?<\/metadata>\s*/gi,
    "",
  );

const embedSesmMetadata = (
  svgText: string,
  metadata: Record<string, unknown>,
) => {
  const cleanSvg = removeExistingSesm(svgText);
  const metadataBlock = `<metadata id="sesm"><![CDATA[\n${escapeCdata(JSON.stringify(metadata, null, 2))}\n]]></metadata>\n`;
  return cleanSvg.replace(/<svg\b([^>]*)>/i, `<svg$1>\n${metadataBlock}`);
};

const runValidator = async (svgPath: string): Promise<ValidatorJson> =>
  new Promise((resolve, reject) => {
    const child = spawn(
      PYTHON_BIN,
      [
        SESM_VALIDATOR,
        svgPath,
        "--schema",
        SESM_SCHEMA,
        "--safe-profile",
        "--json",
      ],
      {
        cwd: SESM_ROOT,
        windowsHide: true,
      },
    );
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("SESM validation timed out."));
    }, SVG_LAB_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", () => {
      clearTimeout(timeout);
      try {
        resolve(JSON.parse(stdout) as ValidatorJson);
      } catch {
        reject(
          new Error(stderr || stdout || "SESM validator did not return JSON."),
        );
      }
    });
  });

const validateSvgText = async (svgText: string): Promise<SvgLabValidation> => {
  assertSvgLabReady();
  const tempDir = await mkdtemp(join(tmpdir(), "svg-lab-"));
  const svgPath = join(tempDir, `${randomUUID()}.svg`);
  try {
    await writeFile(svgPath, svgText, "utf8");
    const result = await runValidator(svgPath);
    return {
      status: result.status || "error",
      profile: result.profile || "sesm-unverified",
      errors: result.errors || [],
      warnings: result.warnings || [],
      metadataVersion: result.metadata_version || null,
      metadata: extractSesmMetadata(svgText),
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

const makeDiff = (before: string, after: string) => {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  return {
    beforeLineCount: beforeLines.length,
    afterLineCount: afterLines.length,
    additions: Math.max(0, afterLines.length - beforeLines.length),
    metadataAdded:
      !extractSesmMetadata(before) && Boolean(extractSesmMetadata(after)),
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  connectionTimeout: EMAIL_TIMEOUT_MS,
  greetingTimeout: EMAIL_TIMEOUT_MS,
  socketTimeout: EMAIL_TIMEOUT_MS,
  auth: {
    user: EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMailWithTimeout = (mailOptions: nodemailer.SendMailOptions) =>
  Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("SMTP send timed out.")),
        EMAIL_TIMEOUT_MS,
      ),
    ),
  ]);

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET,
          response: token,
        }),
      },
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

// Contact form endpoint
app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, category, message, turnstileToken } = req.body;

    // Validate required fields
    if (
      [name, email, category, message].some(
        (field) => typeof field !== "string" || !field.trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const senderName = name.trim();
    const senderEmail = email.trim();
    const messageCategory = category.trim();
    const messageBody = message.trim();

    // Verify Turnstile when a frontend token is provided.
    if (turnstileToken && !(await verifyTurnstileToken(turnstileToken))) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token. Please try again.",
      });
    }

    // Send email
    const escapedName = escapeHtml(senderName);
    const escapedEmail = escapeHtml(senderEmail);
    const escapedCategory = escapeHtml(messageCategory);
    const escapedMessage = escapeHtml(messageBody).replace(/\n/g, "<br>");

    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: senderEmail,
      subject: `[APTlantis Contact] ${messageCategory} - ${senderName}`,
      text: `
Name: ${senderName}
Email: ${senderEmail}
Category: ${messageCategory}

Message:
${messageBody}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${escapedName}</p>
<p><strong>Email:</strong> ${escapedEmail}</p>
<p><strong>Category:</strong> ${escapedCategory}</p>
<hr>
<h3>Message:</h3>
<p>${escapedMessage}</p>
      `,
    };

    await sendMailWithTimeout(mailOptions);

    res.json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

const sendSvgLabError = (res: Response, error: unknown, status = 400) => {
  const message =
    error instanceof Error ? error.message : "SVG Lab request failed.";
  res.status(status).json({
    success: false,
    message,
  });
};

app.post("/api/svg-lab/validate", async (req: Request, res: Response) => {
  try {
    const svgText = assertSvgText(req.body?.svgText);
    const validation = await validateSvgText(svgText);
    res.json(validation);
  } catch (error) {
    sendSvgLabError(res, error);
  }
});

app.post("/api/svg-lab/generate", async (req: Request, res: Response) => {
  try {
    const svgText = assertSvgText(req.body?.svgText);
    const metadata = buildSesmMetadata(
      (req.body?.metadata || {}) as SvgLabMetadataForm,
    );
    const generatedSvg = embedSesmMetadata(svgText, metadata);
    const validation = await validateSvgText(generatedSvg);

    res.json({
      svgText: generatedSvg,
      metadata,
      validation,
      diff: makeDiff(svgText, generatedSvg),
    });
  } catch (error) {
    sendSvgLabError(res, error);
  }
});

app.get("/api/svg-lab/examples", async (_req: Request, res: Response) => {
  try {
    assertSvgLabReady();
    const examples = await Promise.all(
      svgLabExamples.map(async (example) => ({
        id: example.id,
        title: example.title,
        description: example.description,
        svgText: await readFile(example.file, "utf8"),
        expectedStatus: example.expectedStatus,
      })),
    );
    res.json(examples);
  } catch (error) {
    sendSvgLabError(res, error, 500);
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use(
  (
    err: Error & { type?: string; status?: number },
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (err.type === "entity.too.large" || err.status === 413) {
      res.status(413).json({
        success: false,
        message: `SVG Lab requests are limited to ${SVG_LAB_MAX_BYTES} bytes of SVG content.`,
      });
      return;
    }
    next(err);
  },
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
