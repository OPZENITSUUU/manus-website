import { createFileRoute } from "@tanstack/react-router";
import { clearLoginCookie, destroySession, sameOrigin } from "../../../lib/admin-auth.server";

export const Route=createFileRoute("/api/admin/logout")({
  server:{handlers:{
    POST:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false},{status:403});
      await destroySession(request);
      return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Set-Cookie":clearLoginCookie(),"Cache-Control":"no-store"}});
    }
  }}
});
