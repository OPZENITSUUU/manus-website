import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { bindings } from "../../lib/bindings.server";
import { sameOrigin } from "../../lib/admin-auth.server";

const Schema=z.object({
  name:z.string().trim().min(1).max(80),
  phone:z.string().trim().min(7).max(30),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:z.string().regex(/^\d{2}:\d{2}$/),
  guests:z.coerce.number().int().min(1).max(20)
});

export const Route=createFileRoute("/api/bookings")({
  server:{handlers:{
    POST:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false,code:"bad_origin"},{status:403});
      let input;try{input=Schema.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_input"},{status:400});}
      const {DB}=bindings();if(!DB)return Response.json({ok:false,code:"not_configured"},{status:503});
      await DB.prepare("INSERT INTO bookings(id,name,phone,date,time,guests,status) VALUES(?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(),input.name,input.phone,input.date,input.time,input.guests,"new").run();
      return Response.json({ok:true});
    }
  }}
});
