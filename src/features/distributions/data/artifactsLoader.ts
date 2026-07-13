const ARTIFACTS_ENDPOINT = "/data/nixos.artifacts.json";

export type ArtifactType = "iso" | "zip" | "torrent";

export interface ArtifactHashes {
  [algorithm: string]: string;
}

export interface IsoMetadata {
  architecture?: string;
  variant?: string;
  distro?: string;
}

interface ArtifactRecord {
  id: string;
  type: ArtifactType;
  filename: string;
  size_bytes: number;
  hashes?: ArtifactHashes;
  iso?: IsoMetadata;
  tags?: string[];
}

export interface Artifact extends ArtifactRecord {
  hashes: ArtifactHashes;
  tags: string[];
}

let artifactCache: Artifact[] | null = null;
let inflightRequest: Promise<Artifact[]> | null = null;

const normalizeArtifact = (record: ArtifactRecord): Artifact => ({
  ...record,
  hashes: record.hashes ?? {},
  tags: record.tags ?? [],
});

/**
 * Loads artifact metadata from the static JSON file in /public/data.
 * Results are cached after the first successful request.
 */
export const loadArtifacts = async (): Promise<Artifact[]> => {
  if (artifactCache) {
    return artifactCache;
  }

  if (!inflightRequest) {
    inflightRequest = fetch(ARTIFACTS_ENDPOINT)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load artifacts (${response.status})`);
        }
        return response.json() as Promise<ArtifactRecord[]>;
      })
      .then((records) => {
        artifactCache = records.map(normalizeArtifact);
        return artifactCache;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }

  return inflightRequest;
};
