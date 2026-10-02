import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, sameOrigin, verifyEmailChangeCode } from "../../../lib/admin-auth.server";
const Schema=z.object({code:z.string().regex(/^\d{6}$/)});
export const Route=createFileRoute("/api/admin/email-change-verify-code")({server:{handlers:{POST:async({request})=>{if(!sameOrigin(request))return Response.json({ok:false},{status:403});const admin=await getAdmin(request);if(!admin)return Response.json({ok:false,code:"unauthorized"},{status:401});let input;try{input=Schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_code"},{status:400});}return await verifyEmailChangeCode(admin.id,input.code)?Response.json({ok:true}):Response.json({ok:false,code:"invalid_code"},{status:400});}}}});
