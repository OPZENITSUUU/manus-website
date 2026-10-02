import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, sameOrigin } from "../../../lib/admin-auth.server";
import { bindings } from "../../../lib/bindings.server";

const Item=z.object({
  id:z.string().regex(/^[A-Za-z0-9_-]+$/).max(64),
  name:z.string().trim().min(1).max(100),
  category:z.string().trim().min(1).max(80),
  note:z.string().trim().max(180),
  price:z.union([z.string().regex(/^\d+(\.\d{1,2})?$/).max(20),z.literal(""),z.null()]).optional(),
  available:z.boolean(),
  sort_order:z.number().int().min(0).max(9999)
});

export const Route=createFileRoute("/api/admin/menu")({
  server:{handlers:{
    GET:async({request})=>{
      if(!await getAdmin(request))return Response.json({ok:false},{status:401});
      const {DB}=bindings();if(!DB)return Response.json({ok:false},{status:503});
      const result=await DB.prepare("SELECT id,name,category,note,price,image_key,available,sort_order FROM menu_items ORDER BY sort_order,id").all();
      return Response.json({ok:true,items:result.results},{headers:{"Cache-Control":"no-store"}});
    },
    POST:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false},{status:403});
      if(!await getAdmin(request))return Response.json({ok:false},{status:401});
      const {DB}=bindings();if(!DB)return Response.json({ok:false},{status:503});
      let input;try{input=Item.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_input"},{status:400});}
      await DB.prepare("INSERT INTO menu_items(id,name,category,note,price,available,sort_order,updated_at) VALUES(?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,note=excluded.note,price=excluded.price,available=excluded.available,sort_order=excluded.sort_order,updated_at=datetime('now')")
        .bind(input.id,input.name,input.category,input.note,input.price||null,input.available?1:0,input.sort_order).run();
      return Response.json({ok:true});
    },
    DELETE:async({request})=>{
      if(!sameOrigin(request))return Response.json({ok:false},{status:403});
      if(!await getAdmin(request))return Response.json({ok:false},{status:401});
      const id=new URL(request.url).searchParams.get("id")||"";
      if(!/^[A-Za-z0-9_-]+$/.test(id))return Response.json({ok:false},{status:400});
      const {DB}=bindings();if(!DB)return Response.json({ok:false},{status:503});
      await DB.prepare("DELETE FROM menu_items WHERE id=?").bind(id).run();
      return Response.json({ok:true});
    }
  }}
});
