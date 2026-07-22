import { loadPortfolio } from "../features/projects/data/portfolioLoader";
import type { PortfolioData, ProjectRecord } from "../features/projects/types";

type JsonSchema = Record<string, unknown>;

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: unknown) => Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
};

type WebMcpContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: WebMcpContext;
  }

  interface Navigator {
    modelContext?: WebMcpContext;
  }
}

const PUBLIC_RESOURCES = [
  {
    name: "API catalog",
    url: "/.well-known/api-catalog",
    type: "application/linkset+json",
  },
  {
    name: "Public manifest",
    url: "/data/manifest.json",
    type: "application/json",
  },
  {
    name: "Agent skills index",
    url: "/.well-known/agent-skills/index.json",
    type: "application/json",
  },
  {
    name: "Sitemap",
    url: "/sitemap.xml",
    type: "application/xml",
  },
  {
    name: "Auth.md",
    url: "/auth.md",
    type: "text/markdown",
  },
  {
    name: "Web Bot Auth key directory",
    url: "/.well-known/http-message-signatures-directory",
    type: "application/http-message-signatures-directory+json",
  },
];

const boundedStringArray = (items: string[], limit = 8) =>
  items.slice(0, limit);

const compactProject = (project: ProjectRecord) => ({
  id: project.id,
  name: project.name,
  status: project.status,
  lifecycle: project.lifecycle,
  governanceGroup: project.governanceGroup,
  governingStandard: project.governingStandard,
  completion: project.completion,
  summary: project.summary,
  tags: boundedStringArray(project.tags),
  capabilities: boundedStringArray(project.capabilities, 5),
  missingPieces: boundedStringArray(project.missingPieces, 5),
  url: `/project/${project.id}`,
});

const projectEvidence = (project: ProjectRecord) => ({
  screenshots: project.screenshots.slice(0, 6),
  video: project.video,
  documentationOutputs: boundedStringArray(project.documentationOutputs),
  repositoryUrl: project.repoUrl || null,
  logo: project.logoSrc || null,
});

const normalize = (value: unknown) =>
  typeof value === "string" ? value.toLowerCase().trim() : "";

const stringValue = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
};

const numberValue = (
  source: Record<string, unknown>,
  key: string,
  fallback: number,
) => {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const inputRecord = (input: unknown): Record<string, unknown> =>
  input && typeof input === "object" ? (input as Record<string, unknown>) : {};

const getPortfolio = async (): Promise<PortfolioData> => loadPortfolio();

const searchProjects = async (input: unknown) => {
  const params = inputRecord(input);
  const query = normalize(params.query);
  const status = stringValue(params, "status");
  const governanceGroup = stringValue(params, "governanceGroup");
  const limit = Math.min(Math.max(numberValue(params, "limit", 10), 1), 20);
  const portfolio = await getPortfolio();

  const projects = portfolio.projects
    .filter((project) => {
      const text = normalize(
        [
          project.name,
          project.summary,
          project.ecosystemRole,
          project.governanceGroup,
          project.governingStandard,
          ...project.tags,
          ...project.capabilities,
        ].join(" "),
      );
      const statusMatches = !status || project.status === status;
      const groupMatches =
        !governanceGroup || project.governanceGroup === governanceGroup;
      const queryMatches = !query || text.includes(query);
      return statusMatches && groupMatches && queryMatches;
    })
    .slice(0, limit)
    .map(compactProject);

  return {
    query: query || null,
    status: status || null,
    governanceGroup: governanceGroup || null,
    count: projects.length,
    projects,
  };
};

const getProject = async (input: unknown) => {
  const params = inputRecord(input);
  const id = stringValue(params, "id");
  const portfolio = await getPortfolio();
  const project = portfolio.projects.find((candidate) => candidate.id === id);

  if (!project) {
    return {
      found: false,
      id,
      message: "No Aptlantis Studio project matched that id.",
    };
  }

  return {
    found: true,
    project: {
      ...compactProject(project),
      ecosystemRole: project.ecosystemRole,
      operationalCompleteness: project.operationalCompleteness,
      productCompleteness: project.productCompleteness,
      interfaces: boundedStringArray(project.interfaces),
      produces: boundedStringArray(project.produces),
      consumes: boundedStringArray(project.consumes),
      dependsOn: boundedStringArray(project.dependsOn),
      nextSteps: boundedStringArray(project.nextSteps),
      potentialImprovements: boundedStringArray(project.potentialImprovements),
      evidence: projectEvidence(project),
    },
  };
};

const listPublicResources = async () => ({
  origin: window.location.origin,
  resources: PUBLIC_RESOURCES.map((resource) => ({
    ...resource,
    absoluteUrl: new URL(resource.url, window.location.origin).toString(),
  })),
});

const navigateToProject = async (input: unknown) => {
  const params = inputRecord(input);
  const id = stringValue(params, "id");
  const portfolio = await getPortfolio();
  const project = portfolio.projects.find((candidate) => candidate.id === id);

  if (!project) {
    return {
      navigated: false,
      id,
      message: "No Aptlantis Studio project matched that id.",
    };
  }

  const url = `/project/${project.id}`;
  window.location.assign(url);
  return {
    navigated: true,
    id: project.id,
    name: project.name,
    url,
  };
};

const searchProjectsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    query: {
      type: "string",
      description:
        "Text to match against project names, summaries, tags, standards, and capabilities.",
    },
    status: {
      type: "string",
      description: "Exact project status value to match.",
    },
    governanceGroup: {
      type: "string",
      description: "Exact governance group value to match.",
    },
    limit: {
      type: "number",
      minimum: 1,
      maximum: 20,
      description: "Maximum number of projects to return.",
    },
  },
};

const projectIdSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: {
      type: "string",
      description: "Aptlantis Studio project id, used in /project/:id URLs.",
    },
  },
};

const emptySchema = {
  type: "object",
  additionalProperties: false,
  properties: {},
};

export const registerAptlantisWebMcpTools = () => {
  const modelContext = document.modelContext ?? navigator.modelContext;

  if (!modelContext?.registerTool) {
    return;
  }

  const controller = new AbortController();
  const readOnly = { readOnlyHint: true, untrustedContentHint: false };
  const tools: WebMcpTool[] = [
    {
      name: "aptlantis.searchProjects",
      title: "Search Aptlantis Projects",
      description:
        "Search public Aptlantis Studio project catalog records by query, status, and governance group.",
      inputSchema: searchProjectsSchema,
      execute: searchProjects,
      annotations: readOnly,
    },
    {
      name: "aptlantis.getProject",
      title: "Get Aptlantis Project",
      description:
        "Return public catalog details, evidence paths, capabilities, and known gaps for one Aptlantis Studio project.",
      inputSchema: projectIdSchema,
      execute: getProject,
      annotations: readOnly,
    },
    {
      name: "aptlantis.listPublicResources",
      title: "List Aptlantis Public Resources",
      description:
        "List public agent-readable Aptlantis Studio resources such as manifests, catalogs, sitemap, Auth.md, and key directory.",
      inputSchema: emptySchema,
      execute: listPublicResources,
      annotations: readOnly,
    },
    {
      name: "aptlantis.navigateToProject",
      title: "Navigate To Aptlantis Project",
      description:
        "Navigate the browser to a public Aptlantis Studio project page by project id.",
      inputSchema: projectIdSchema,
      execute: navigateToProject,
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    },
  ];

  void Promise.all(
    tools.map((tool) =>
      modelContext
        .registerTool(tool, { signal: controller.signal })
        .catch((error: unknown) => {
          console.warn(`WebMCP tool registration failed: ${tool.name}`, error);
        }),
    ),
  );
};
