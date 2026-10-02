import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { changeAdminEmail, clearLoginCookie, getAdmin, sameOrigin } from "../../../lib/admin-auth.server";
const Schema=z.object({newEmail:z.string().email().max(254)});
export const Route=createFileRoute("/api/admin/email-change")({server:{handlers:{POST:async({request})=>{if(!sameOrigin(request))return Response.json({ok:false},{status:403});const admin=await getAdmin(request);if(!admin)return Response.json({ok:false,code:"unauthorized"},{status:401});let input;try{input=Schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_email"},{status:400});}const ok=await changeAdminEmail(admin.id,input.newEmail);if(!ok)return Response.json({ok:false,code:"verification_required"},{status:403});return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Set-Cookie":clearLoginCookie(),"Cache-Control":"no-store"}});}}}});
