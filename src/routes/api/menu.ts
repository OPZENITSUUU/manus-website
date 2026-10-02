import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

export const Route=createFileRoute("/api/menu")({
  server:{handlers:{
    GET:async()=>{
      const {DB}=bindings();
      if(!DB)return Response.json({ok:false,items:[]},{status:503});
      const result=await DB.prepare("SELECT id,name,category,note,price,image_key,available,sort_order FROM menu_items WHERE available=1 ORDER BY sort_order,id").all();
      return Response.json({ok:true,items:result.results},{headers:{"Cache-Control":"no-store"}});
    }
  }}
});
