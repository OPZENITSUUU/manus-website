import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { changePassword, clearLoginCookie, getAdmin, sameOrigin, validPassword } from "../../../lib/admin-auth.server";

const Schema=z.object({password:z.string().min(10).max(128),confirmPassword:z.string().min(10).max(128)});

export const Route=createFileRoute("/api/admin/password-change")({
  server:{handlers:{
    POST:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false},{status:403});
      const admin=await getAdmin(request);
      if(!admin)return Response.json({ok:false,code:"unauthorized"},{status:401});
      let input;try{input=Schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_password"},{status:400});}
      if(!validPassword(input.password)||input.password!==input.confirmPassword)return Response.json({ok:false,code:"invalid_password"},{status:400});
      const ok=await changePassword(admin.id,input.password);
      if(!ok)return Response.json({ok:false,code:"verification_required"},{status:403});
      return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Set-Cookie":clearLoginCookie(),"Cache-Control":"no-store"}});
    }
  }}
});
