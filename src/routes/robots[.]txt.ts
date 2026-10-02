import { createFileRoute } from "@tanstack/react-router";
export const Route=createFileRoute("/robots.txt")({server:{handlers:{GET:async()=>new Response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nSitemap: https://billedihatti.higgsfield.app/sitemap.xml\n",{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=86400"}})}}});
