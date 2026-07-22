const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</data/manifest.json>; rel="describedby"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
  '</.well-known/http-message-signatures-directory>; rel="key-directory"; type="application/http-message-signatures-directory+json"',
].join(", ");

const wantsMarkdown = (request: Request) => {
  const accept = request.headers.get("accept") || "";
  return accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry.startsWith("text/markdown"));
};

const addDiscoveryHeaders = (headers: Headers) => {
  headers.set("Link", DISCOVERY_LINKS);
  headers.append("Vary", "Accept");
  return headers;
};

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
};

export const onRequest = async ({ request, next }: PagesContext) => {
  const url = new URL(request.url);

  if (url.pathname === "/" && wantsMarkdown(request)) {
    const markdownUrl = new URL("/index.md", request.url);
    const markdownResponse = await fetch(markdownUrl.toString());
    const body = await markdownResponse.text();
    const headers = addDiscoveryHeaders(new Headers(markdownResponse.headers));
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set(
      "x-markdown-tokens",
      String(body.split(/\s+/).filter(Boolean).length),
    );
    return new Response(body, {
      status: 200,
      headers,
    });
  }

  const response = await next();

  if (url.pathname === "/") {
    const headers = addDiscoveryHeaders(new Headers(response.headers));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};
