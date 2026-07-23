import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MetaTags from "../../../components/MetaTags";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  MaterialIcon,
  dossierToneText,
} from "../../projects/components/DossierPrimitives";
import type { DossierTone } from "../../projects/components/DossierPrimitives";

interface AtlasThemeFile {
  targetId: string;
  label: string;
  path: string;
  filename: string;
  format: string;
}

interface AtlasLanguage {
  id: string;
  name: string;
  description: string;
  site: string | null;
  logo: string | null;
  hasThemes: boolean;
  themeCount: number;
  themes: AtlasThemeFile[];
}

interface AtlasTarget {
  id: string;
  label: string;
  icon: string;
}

interface AtlasData {
  generatedAt: string;
  counts: {
    languages: number;
    withThemes: number;
    themeTargets: number;
    themeFiles: number;
  };
  targets: AtlasTarget[];
  languages: AtlasLanguage[];
}

type FilterMode = "all" | "themes" | "logos";
type SelectionMap = Record<string, Set<string>>;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (buffer: number[], value: number) => {
  buffer.push(value & 0xff, (value >>> 8) & 0xff);
};

const writeUint32 = (buffer: number[], value: number) => {
  buffer.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  );
};

const dosTimestamp = () => {
  const now = new Date();
  const time =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  return { time, date };
};

const createStoredZip = (
  files: Array<{ name: string; bytes: Uint8Array }>,
) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const central: number[] = [];
  let offset = 0;
  const { time, date } = dosTimestamp();

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name.replace(/\\/g, "/"));
    const checksum = crc32(file.bytes);
    const local: number[] = [];

    writeUint32(local, 0x04034b50);
    writeUint16(local, 20);
    writeUint16(local, 0);
    writeUint16(local, 0);
    writeUint16(local, time);
    writeUint16(local, date);
    writeUint32(local, checksum);
    writeUint32(local, file.bytes.length);
    writeUint32(local, file.bytes.length);
    writeUint16(local, nameBytes.length);
    writeUint16(local, 0);
    localParts.push(new Uint8Array(local), nameBytes, file.bytes);

    writeUint32(central, 0x02014b50);
    writeUint16(central, 20);
    writeUint16(central, 20);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, time);
    writeUint16(central, date);
    writeUint32(central, checksum);
    writeUint32(central, file.bytes.length);
    writeUint32(central, file.bytes.length);
    writeUint16(central, nameBytes.length);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, 0);
    writeUint32(central, offset);
    central.push(...nameBytes);

    offset += local.length + nameBytes.length + file.bytes.length;
  });

  const centralOffset = offset;
  const centralBytes = new Uint8Array(central);
  const end: number[] = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, files.length);
  writeUint16(end, files.length);
  writeUint32(end, centralBytes.length);
  writeUint32(end, centralOffset);
  writeUint16(end, 0);

  return new Blob([...localParts, centralBytes, new Uint8Array(end)], {
    type: "application/zip",
  });
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "theme";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const targetTone = (targetId: string): DossierTone => {
  if (targetId === "jetbrains") return "violet";
  if (targetId === "notepadpp") return "amber";
  if (targetId === "alacritty") return "green";
  if (targetId === "windows-terminal") return "blue";
  if (targetId === "web") return "teal";
  return "cyan";
};

const LanguageAtlasPage = () => {
  const [atlas, setAtlas] = useState<AtlasData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [selection, setSelection] = useState<SelectionMap>({});
  const [isPacking, setIsPacking] = useState(false);

  useEffect(() => {
    fetch("/data/language-atlas/atlas.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Language Atlas dataset did not load.");
        }
        return response.json() as Promise<AtlasData>;
      })
      .then(setAtlas)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Atlas load failed"),
      );
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!atlas) return [];
    const needle = query.trim().toLowerCase();
    return atlas.languages.filter((language) => {
      const text = `${language.name} ${language.description}`.toLowerCase();
      const matchesQuery = !needle || text.includes(needle);
      const matchesFilter =
        filter === "all" ||
        (filter === "themes" && language.hasThemes) ||
        (filter === "logos" && !language.hasThemes);
      const matchesTarget =
        targetFilter === "all" ||
        language.themes.some((theme) => theme.targetId === targetFilter);
      return matchesQuery && matchesFilter && matchesTarget;
    });
  }, [atlas, filter, query, targetFilter]);

  const selectedItems = useMemo(() => {
    if (!atlas) return [];
    return atlas.languages.flatMap((language) => {
      const targets = selection[language.id] || new Set<string>();
      return language.themes
        .filter((theme) => targets.has(theme.targetId))
        .map((theme) => ({ language, theme }));
    });
  }, [atlas, selection]);

  const selectedLanguageCount = new Set(
    selectedItems.map((item) => item.language.id),
  ).size;

  const updateSelection = (
    language: AtlasLanguage,
    targetId: string,
    selected: boolean,
  ) => {
    setSelection((current) => {
      const next = { ...current };
      const targets = new Set(next[language.id] || []);
      if (selected) {
        targets.add(targetId);
      } else {
        targets.delete(targetId);
      }
      if (targets.size) {
        next[language.id] = targets;
      } else {
        delete next[language.id];
      }
      return next;
    });
  };

  const setLanguageSelected = (language: AtlasLanguage, selected: boolean) => {
    setSelection((current) => {
      const next = { ...current };
      if (selected) {
        next[language.id] = new Set(
          language.themes.map((theme) => theme.targetId),
        );
      } else {
        delete next[language.id];
      }
      return next;
    });
  };

  const downloadSelection = async () => {
    if (!selectedItems.length) return;
    setIsPacking(true);
    try {
      const files = await Promise.all(
        selectedItems.map(async ({ language, theme }) => {
          const response = await fetch(theme.path);
          if (!response.ok) {
            throw new Error(`${theme.label} theme missing for ${language.name}`);
          }
          const bytes = new Uint8Array(await response.arrayBuffer());
          return {
            name: `${slugify(language.name)}/${slugify(theme.label)}/${theme.filename}`,
            bytes,
          };
        }),
      );
      const manifest = {
        generatedAt: new Date().toISOString(),
        source: "https://aptlantis.studio/language-atlas",
        selections: selectedItems.map(({ language, theme }) => ({
          language: language.name,
          target: theme.label,
          sourcePath: theme.path,
          filename: theme.filename,
        })),
      };
      files.push({
        name: "language-atlas-selection-manifest.json",
        bytes: new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
      });
      downloadBlob(createStoredZip(files), "aptlantis-language-atlas.zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download pack failed");
    } finally {
      setIsPacking(false);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-atl-archive">
        <h1 className="text-3xl font-black">Language Atlas did not load</h1>
        <p className="mt-3 text-atl-silver">{error}</p>
      </main>
    );
  }

  if (!atlas) return <LoadingSpinner />;

  return (
    <div className="min-h-screen text-atl-archive">
      <MetaTags
        title="Language Atlas | Aptlantis"
        description="Browse Aptlantis programming-language logos and generate mixed theme packs for editors and terminals."
        canonicalUrl="https://aptlantis.studio/language-atlas"
        ogTitle="Language Atlas | Aptlantis"
        ogDescription="Interactive logo and theme picker for the Aptlantis Logos & Themes pipeline."
      />
      <main className="mx-auto max-w-[1840px] px-4 pb-28 pt-8 md:px-8">
        <nav
          className="mb-6 flex items-center gap-2 text-sm text-cyan-300/80"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-cyan-100">
            Home
          </Link>
          <MaterialIcon name="chevron_right" className="text-base" />
          <span className="text-atl-silver">Language Atlas</span>
        </nav>

        <section className="dossier-card mb-6 overflow-hidden p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
            <div>
              <p className="atl-eyebrow text-cyan-300">Logos & Themes</p>
              <h1 className="atl-title mt-3 text-5xl font-black md:text-6xl">
                Language Atlas
              </h1>
              <p className="mt-5 max-w-4xl text-base leading-7 text-atl-silver">
                Public picker for Aptlantis programming-language logos and
                generated theme outputs. Select any mix of languages and
                targets, then download one local ZIP pack built from public
                files on this site.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  [`${atlas.counts.languages} languages`, "language"],
                  [`${atlas.counts.withThemes} with themes`, "palette"],
                  [`${atlas.counts.themeTargets} target groups`, "hub"],
                  [`${atlas.counts.themeFiles} theme files`, "inventory_2"],
                ].map(([label, icon]) => (
                  <span
                    key={label}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100"
                  >
                    <MaterialIcon name={icon} className="text-base" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <section className="rounded-[8px] border border-cyan-100/15 bg-slate-950/30 p-5">
              <h2 className="mb-3 text-lg font-black text-atl-archive">
                Pack Targets
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {atlas.targets.map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() =>
                      setTargetFilter((current) =>
                        current === target.id ? "all" : target.id,
                      )
                    }
                    className={`flex min-h-10 items-center gap-2 rounded-[6px] border px-3 text-sm transition ${
                      targetFilter === target.id
                        ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                        : "border-cyan-100/15 bg-slate-950/20 text-atl-silver hover:border-cyan-300/40"
                    }`}
                  >
                    <MaterialIcon name={target.icon} />
                    {target.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="sticky top-[81px] z-20 mb-5 rounded-[8px] border border-cyan-100/15 bg-atl-void/90 p-3 backdrop-blur">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-[8px] border border-cyan-100/15 bg-slate-950/35 px-3 text-atl-silver">
              <MaterialIcon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search languages..."
                className="w-full bg-transparent text-sm text-atl-archive outline-none placeholder:text-atl-frost"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["themes", "Has Themes"],
                ["logos", "Logo Only"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id as FilterMode)}
                  className={`min-h-9 rounded-full border px-4 text-sm font-bold ${
                    filter === id
                      ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                      : "border-cyan-100/15 bg-slate-950/30 text-atl-silver"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredLanguages.map((language) => {
            const selectedTargets = selection[language.id] || new Set<string>();
            const allSelected =
              language.themes.length > 0 &&
              selectedTargets.size === language.themes.length;
            return (
              <article
                key={language.id}
                className="overflow-hidden rounded-[8px] border border-cyan-100/15 bg-slate-950/25"
              >
                <div className="grid min-h-40 place-items-center bg-black/20 p-5">
                  {language.logo ? (
                    <img
                      src={language.logo}
                      alt={`${language.name} Aptlantis logo`}
                      loading="lazy"
                      className="h-28 w-28 rounded-[6px] object-contain"
                    />
                  ) : (
                    <MaterialIcon
                      name="image_not_supported"
                      className="text-5xl text-atl-frost"
                    />
                  )}
                </div>
                <div className="border-t border-cyan-100/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-black">
                        {language.name}
                      </h2>
                      <p className="mt-1 min-h-10 text-sm leading-5 text-atl-frost">
                        {language.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!language.themes.length}
                      onClick={() =>
                        setLanguageSelected(language, !allSelected)
                      }
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-[6px] border ${
                        allSelected
                          ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                          : "border-cyan-100/15 text-atl-silver"
                      } disabled:opacity-35`}
                      aria-label={`Select all ${language.name} themes`}
                    >
                      <MaterialIcon
                        name={allSelected ? "select_check_box" : "select_all"}
                      />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {language.site && (
                      <a
                        href={language.site}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-cyan-300/25 bg-cyan-300/10 text-sm font-bold text-cyan-100 no-underline"
                      >
                        Site <MaterialIcon name="open_in_new" />
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {language.themes.map((theme) => {
                        const selected = selectedTargets.has(theme.targetId);
                        return (
                          <button
                            key={theme.targetId}
                            type="button"
                            onClick={() =>
                              updateSelection(
                                language,
                                theme.targetId,
                                !selected,
                              )
                            }
                            className={`min-h-8 rounded-[6px] border px-2 text-xs font-bold transition ${
                              selected
                                ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                                : `border-cyan-100/15 bg-slate-950/35 ${dossierToneText(
                                    targetTone(theme.targetId),
                                  )}`
                            }`}
                          >
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-100/15 bg-atl-void/95 px-4 py-3 text-atl-archive backdrop-blur">
        <div className="mx-auto flex max-w-[1840px] flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <strong>{selectedItems.length}</strong>
            <span className="text-atl-frost">theme outputs selected from</span>
            <strong>{selectedLanguageCount}</strong>
            <span className="text-atl-frost">languages</span>
          </div>
          <div className="md:ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setSelection({})}
              disabled={!selectedItems.length || isPacking}
              className="min-h-10 rounded-[8px] border border-cyan-100/15 px-4 text-sm font-bold text-atl-silver disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={downloadSelection}
              disabled={!selectedItems.length || isPacking}
              className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-cyan-300/50 bg-cyan-300/15 px-4 text-sm font-black text-cyan-100 disabled:opacity-40"
            >
              <MaterialIcon name="download" />
              {isPacking ? "Building Pack..." : "Download Pack"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageAtlasPage;
