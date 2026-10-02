import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, ensureAdminSeeded } from "../../../lib/admin-auth.server";

export const Route=createFileRoute("/api/admin/me")({
  server:{handlers:{
    GET:async({request})=>{
      const configured=await ensureAdminSeeded();
      const admin=await getAdmin(request);
      if(!admin)return Response.json({ok:false,configured},{status:401,headers:{"Cache-Control":"no-store"}});
      return Response.json({ok:true,email:admin.email},{headers:{"Cache-Control":"no-store"}});
    }
  }}
});
