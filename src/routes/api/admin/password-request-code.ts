import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, issueCode, sameOrigin } from "../../../lib/admin-auth.server";
import { sendPasswordCode } from "../../../lib/mail.server";
export const Route=createFileRoute("/api/admin/password-request-code")({server:{handlers:{POST:async({request})=>{if(!sameOrigin(request))return Response.json({ok:false},{status:403});const admin=await getAdmin(request);if(!admin)return Response.json({ok:false,code:"unauthorized"},{status:401});const code=await issueCode(admin.id);if(!code)return Response.json({ok:false,code:"cooldown"},{status:429});try{await sendPasswordCode(admin.email,code);return Response.json({ok:true});}catch{return Response.json({ok:false,code:"email_not_configured"},{status:503});}}}}});
