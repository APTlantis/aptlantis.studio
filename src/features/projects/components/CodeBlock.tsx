import { useEffect, useId, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";

declare global {
  interface Window {
    Prism?: {
      highlightElement: (element: Element) => void;
    };
  }
}

const codeShell =
  "rounded-[8px] border border-atl-ridge bg-atl-void/88 text-xs leading-5 text-atl-silver";

export const MermaidDiagram = ({ chart }: { chart: string }) => {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark",
      themeVariables: {
        background: "#050913",
        primaryColor: "#172536",
        primaryTextColor: "#e1e7db",
        primaryBorderColor: "#627786",
        lineColor: "#768892",
        secondaryColor: "#0b1728",
        tertiaryColor: "#262f39",
      },
    });

    mermaid
      .render(`aptlantis-mermaid-${id}`, chart)
      .then((result) => {
        if (mounted) {
          setSvg(result.svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to render Mermaid diagram",
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [chart, id]);

  if (error) {
    return <CodeBlock code={chart} language="mermaid" title="Mermaid source" />;
  }

  return (
    <div
      className="overflow-auto rounded-[8px] border border-atl-ridge bg-atl-void/88 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export const CodeBlock = ({
  code,
  language = "text",
  title,
  maxHeight,
}: {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const normalizedLanguage = useMemo(() => language.toLowerCase(), [language]);

  useEffect(() => {
    if (codeRef.current && window.Prism) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [code, normalizedLanguage]);

  if (normalizedLanguage === "mermaid") {
    return <MermaidDiagram chart={code} />;
  }

  const wrapStyle = {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  } as const;

  return (
    <div className={`${codeShell} max-w-full overflow-hidden`}>
      {title && (
        <div className="border-b border-atl-ridge/60 px-4 py-2 text-xs font-bold uppercase text-atl-frost">
          {title}
        </div>
      )}
      <pre
        className={`m-0 overflow-auto whitespace-pre-wrap break-words bg-transparent p-4 ${maxHeight || ""}`}
        style={wrapStyle}
      >
        <code
          ref={codeRef}
          className={`language-${normalizedLanguage}`}
          style={wrapStyle}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};
