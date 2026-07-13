import type { CommandSchemaMap, PortfolioData } from "../types";

let portfolioPromise: Promise<PortfolioData> | null = null;
let schemaPromise: Promise<CommandSchemaMap> | null = null;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const loadPortfolio = (): Promise<PortfolioData> => {
  portfolioPromise ??= fetchJson<PortfolioData>(
    "/data/projects/portfolio.json",
  );
  return portfolioPromise;
};

export const loadCommandSchemas = (): Promise<CommandSchemaMap> => {
  schemaPromise ??= fetchJson<CommandSchemaMap>(
    "/command-schemas/command-schemas.json",
  );
  return schemaPromise;
};
