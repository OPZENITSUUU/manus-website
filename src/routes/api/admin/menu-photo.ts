import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../../lib/bindings.server";
import { getAdmin, sameOrigin } from "../../../lib/admin-auth.server";

const MAX_SIZE = 5 * 1024 * 1024;

function detect(bytes:Uint8Array) {
  if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return {ext:"jpg",type:"image/jpeg"};
  if(bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)return {ext:"png",type:"image/png"};
  if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return {ext:"webp",type:"image/webp"};
  return null;
}

export const Route=createFileRoute("/api/admin/menu-photo")({server:{handlers:{POST:async({request})=>{if(!sameOrigin(request))return Response.json({ok:false},{status:403});if(!await getAdmin(request))return Response.json({ok:false,code:"unauthorized"},{status:401});const form=await request.formData();const id=String(form.get("id")||"");if(!/^[A-Za-z0-9_-]+$/.test(id))return Response.json({ok:false,code:"invalid_id"},{status:400});const file=form.get("file");if(!(file instanceof File)||file.size<1||file.size>MAX_SIZE)return Response.json({ok:false,code:"invalid_file"},{status:400});const bytes=new Uint8Array(await file.arrayBuffer());const kind=detect(bytes);if(!kind)return Response.json({ok:false,code:"unsupported_image"},{status:400});const {STORAGE}=bindings();if(!STORAGE)return Response.json({ok:false,code:"not_configured"},{status:503});const key=id+"-"+crypto.randomUUID()+"."+kind.ext;await STORAGE.put("menu/"+key,bytes,{httpMetadata:{contentType:kind.type,cacheControl:"public, max-age=31536000, immutable"}});return Response.json({ok:true,key});}}}});
