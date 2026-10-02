import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, sameOrigin } from "../../../lib/admin-auth.server";
import { bindings } from "../../../lib/bindings.server";

export const Route=createFileRoute("/api/admin/bookings")({
  server:{handlers:{
    GET:async({request})=>{
      if(!await getAdmin(request))return Response.json({ok:false},{status:401});
      const {DB}=bindings();
      if(!DB)return Response.json({ok:false},{status:503});
      const result=await DB.prepare("SELECT id,name,phone,date,time,guests,status,created_at FROM bookings ORDER BY created_at DESC").all();
      return Response.json({ok:true,items:result.results},{headers:{"Cache-Control":"no-store"}});
    },
    PATCH:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false},{status:403});
      if(!await getAdmin(request))return Response.json({ok:false},{status:401});
      const schema=z.object({id:z.string().regex(/^[A-Za-z0-9_-]+$/),status:z.enum(["new","confirmed","cancelled"])});
      let input;try{input=schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_input"},{status:400});}
      const {DB}=bindings();if(!DB)return Response.json({ok:false},{status:503});
      await DB.prepare("UPDATE bookings SET status=? WHERE id=?").bind(input.status,input.id).run();
      return Response.json({ok:true});
    }
  }}
});
