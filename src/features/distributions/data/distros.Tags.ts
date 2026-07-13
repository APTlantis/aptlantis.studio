// Generated helper: provides a flattened list of distro tags across aptlantis.distros.json.
import distrosJson from "./aptlantis.distros.json";

// Unique tags aggregated from the distro entries.
export const distroTags: string[] = Array.from(
  new Set(
    (distrosJson as any[])
      .flatMap((item) => (Array.isArray(item.tags) ? item.tags : []))
      .filter(
        (tag): tag is string =>
          typeof tag === "string" && tag.trim().length > 0,
      ),
  ),
).sort();
