import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticate, createSession, failedLogin, isRateLimited, loginCookie, sameOrigin } from "../../../lib/admin-auth.server";

const Schema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(128)});

export const Route=createFileRoute("/api/admin/login")({
  server:{handlers:{
    POST:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false,code:"bad_origin"},{status:403});
      if(await isRateLimited(request))return Response.json({ok:false,code:"rate_limited"},{status:429});
      let input;try{input=Schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_input"},{status:400});}
      const admin=await authenticate(input.email,input.password);
      if(!admin){await failedLogin(request);return Response.json({ok:false,code:"invalid_credentials"},{status:401});}
      const token=await createSession(admin.id);
      return new Response(JSON.stringify({ok:true,email:admin.email}),{headers:{"Content-Type":"application/json","Set-Cookie":loginCookie(token),"Cache-Control":"no-store"}});
    }
  }}
});
