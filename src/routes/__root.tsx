import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import appMetaJson from "../app-meta.json";
import type { ReactNode } from "react";

type AppMeta={og_title?:string;og_description?:string;og_image_url?:string;favicon_url?:string;og_video_url?:string;theme_color?:string};
const meta=appMetaJson as AppMeta;

function head(){
  const title=meta.og_title||"Bille Di Hatti";
  const description=meta.og_description||"Bille Di Hatti, Kamla Nagar, Delhi";
  return {
    meta:[
      {charSet:"utf-8"},
      {name:"viewport",content:"width=device-width, initial-scale=1"},
      {title},
      {name:"description",content:description},
      {name:"theme-color",content:meta.theme_color||""},
      {property:"og:title",content:title},
      {property:"og:description",content:description},
      {property:"og:type",content:"website"},
      {property:"og:image",content:meta.og_image_url||""},
      {name:"twitter:card",content:"summary_large_image"},
      {name:"twitter:image",content:meta.og_image_url||""},
      ...(meta.og_video_url?[{property:"og:video",content:meta.og_video_url}]:[])
    ],
    links:[
      {rel:"stylesheet",href:appCss},
      {rel:"icon",href:meta.favicon_url||"/favicon.svg"},
      {rel:"apple-touch-icon",href:"/apple-touch-icon.png"},
      {rel:"manifest",href:"/site.webmanifest"}
    ]
  };
}

export const Route=createRootRouteWithContext<{queryClient:QueryClient}>()({
  head,
  shellComponent:RootShell,
  component:Root
});

function RootShell({children}:{children:ReactNode}){
  return <html lang="en" style={{colorScheme:"light"}}><head><HeadContent/></head><body>{children}<Scripts/></body></html>;
}
function Root(){
  const {queryClient}=Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>;
}
