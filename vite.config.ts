import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</data/manifest.json>; rel="describedby"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
  '</.well-known/http-message-signatures-directory>; rel="key-directory"; type="application/http-message-signatures-directory+json"',
].join(", ");

const wantsMarkdown = (acceptHeader: string | undefined) =>
  (acceptHeader || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry.startsWith("text/markdown"));

type MiddlewareRequest = { url?: string; headers: { accept?: string } };

type MiddlewareResponse = {
  setHeader: (name: string, value: string) => void;
  statusCode: number;
  end: (body?: string) => void;
};

type MiddlewareNext = () => void;

type MiddlewareHandler = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => void;

type MiddlewareServer = {
  middlewares: {
    use: (handler: MiddlewareHandler) => void;
  };
};

const addAgentDiscoveryMiddleware = (server: MiddlewareServer) => {
  server.middlewares.use((req, res, next) => {
    const pathname = (req.url || "").split("?")[0];

    if (pathname === "/" || pathname === "") {
      res.setHeader("Link", DISCOVERY_LINKS);
      res.setHeader("Vary", "Accept");

      if (wantsMarkdown(req.headers.accept)) {
        const markdown = fs.readFileSync(
          path.resolve(__dirname, "public/index.md"),
          "utf8",
        );
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.setHeader(
          "x-markdown-tokens",
          String(markdown.split(/\s+/).filter(Boolean).length),
        );
        res.end(markdown);
        return;
      }
    }

    next();
  });
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "aptlantis-agent-discovery",
      configureServer: addAgentDiscoveryMiddleware,
      configurePreviewServer: addAgentDiscoveryMiddleware,
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/services/**/target/**"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
