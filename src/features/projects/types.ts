export interface ProjectMedia {
  src: string;
  caption: string;
}

export interface ProjectVideo {
  src: string;
  captions?: string;
  title: string;
  description: string;
}

export interface FrameworkNode {
  id: string;
  title: string;
  abbreviation: string;
  status: string;
  maturity: string;
  version: string;
  description: string;
  scope: string;
  sourcePath: string;
  specification: string;
  schema: string;
  templates: string[];
  examples: string[];
  validators: string[];
  adopterArtifacts: string[];
  readFirst: string[];
  layer: string;
  color: string;
}

export interface FrameworkRelationship {
  source: string;
  target: string;
  type: string;
  label: string;
  strength: number;
}

export interface FrameworkSuite {
  generatedFrom: string[];
  resourceKits: Array<{
    id: string;
    title: string;
    sourcePath: string;
    templates: string[];
    description: string;
  }>;
  nodes: FrameworkNode[];
  relationships: FrameworkRelationship[];
  usagePatterns: Array<{
    title: string;
    steps: string[];
    appliesTo: string[];
  }>;
  mermaid: {
    operatingModel: string;
    adoptionFlow: string;
    artifactChain: string;
  };
}

export interface ProjectRecord {
  id: string;
  name: string;
  sourcePath: string;
  summary: string;
  ecosystemRole: string;
  status: string;
  lifecycle: string;
  governanceGroup: string;
  governingStandard: string;
  completion: number;
  operationalCompleteness: number;
  productCompleteness: number;
  complexity: string;
  strategicRelevance: string;
  maintenanceBurden: string;
  capabilities: string[];
  interfaces: string[];
  produces: string[];
  consumes: string[];
  dependsOn: string[];
  usedBy: string[];
  missingPieces: string[];
  nextSteps: string[];
  potentialImprovements: string[];
  documentationOutputs: string[];
  tags: string[];
  repoUrl: string;
  cloneCommand: string;
  manifestPath: string;
  logoSrc: string;
  screenshots: ProjectMedia[];
  video: ProjectVideo | null;
  helpOutput: string;
  commandWizardSchema: string | null;
  frameworkSuite?: FrameworkSuite;
}

export interface PortfolioPriority {
  id: string;
  name: string;
  completion: number;
  status: string;
  governanceGroup: string;
  next: string;
}

export interface PortfolioData {
  generatedAt: string;
  projectCount: number;
  averageCompletion: number;
  statusCounts: Record<string, number>;
  governanceCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  topPriorities: PortfolioPriority[];
  projects: ProjectRecord[];
}

export interface CommandArgument {
  flag?: string;
  long?: string;
  description: string;
  type: string;
  required?: boolean;
  default?: string;
}

export interface CommandSchema {
  id: string;
  tool: {
    name: string;
    description: string;
    installedName: string;
  };
  actions: Array<{ name: string; description: string }>;
  arguments: CommandArgument[];
  examples?: Array<{ title: string; command: string }>;
}

export type CommandSchemaMap = Record<string, CommandSchema>;
