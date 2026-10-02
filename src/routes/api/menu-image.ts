import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

export const Route=createFileRoute("/api/menu-image")({
  server:{handlers:{
    GET:async({request})=>{
      const key=new URL(request.url).searchParams.get("key")||"";
      if(!/^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(key))return new Response("Not found",{status:404});
      const {STORAGE}=bindings();
      if(!STORAGE)return new Response("Not configured",{status:503});
      const object=await STORAGE.get("menu/"+key);
      if(!object)return new Response("Not found",{status:404});
      return new Response(object.body as unknown as BodyInit,{headers:{"Content-Type":object.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=31536000, immutable","ETag":object.httpEtag}});
    }
  }}
});
