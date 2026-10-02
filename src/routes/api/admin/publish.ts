import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, sameOrigin } from "../../../lib/admin-auth.server";
import { bindings } from "../../../lib/bindings.server";

const Menu=z.object({id:z.string().regex(/^[A-Za-z0-9_-]+$/).max(64),name:z.string().trim().min(1).max(100),category:z.string().trim().min(1).max(80),note:z.string().trim().max(180),price:z.union([z.string().regex(/^\d+(\.\d{1,2})?$/).max(20),z.literal(""),z.null()]),image_key:z.string().regex(/^[A-Za-z0-9_-]+\.(jpg|webp|png)$/).nullable(),available:z.boolean(),sort_order:z.number().int().min(0).max(9999)});
const Review=z.object({id:z.string().regex(/^[A-Za-z0-9_-]+$/).max(80),reviewer_name:z.string().trim().min(1).max(80),rating:z.union([z.number().int().min(1).max(5),z.null()]),review_text:z.string().trim().min(1).max(1200),image_key:z.string().regex(/^reviews\/[A-Za-z0-9_-]+-[0-9a-f-]+\.(jpg|webp|png)$/).nullable(),source:z.string().trim().max(80),published:z.boolean(),sort_order:z.number().int().min(0).max(9999)});
const Booking=z.object({id:z.string().regex(/^[A-Za-z0-9_-]+$/),status:z.enum(["new","confirmed","cancelled"])});
const Payload=z.object({menu:z.array(Menu).max(200),reviews:z.array(Review).max(200),settings:z.object({rating:z.number().min(0).max(5),review_count:z.number().int().min(0).max(9999999)}),bookings:z.array(Booking).max(200)});

export const Route=createFileRoute("/api/admin/publish")({server:{handlers:{POST:async({request})=>{
  if(!sameOrigin(request))return Response.json({ok:false},{status:403});
  if(!await getAdmin(request))return Response.json({ok:false},{status:401});
  const {DB,STORAGE}=bindings();if(!DB)return Response.json({ok:false},{status:503});
  let input;try{input=Payload.parse(await request.json());}catch{return Response.json({ok:false,code:"invalid_payload"},{status:400});}
  const [oldMenu,oldReviews]=await Promise.all([DB.prepare("SELECT id,image_key FROM menu_items").all(),DB.prepare("SELECT id,image_key FROM reviews").all()]);
  const menuIds=new Set(input.menu.map(x=>x.id)),reviewIds=new Set(input.reviews.map(x=>x.id));
  const statements:any[]=[];
  for(const item of input.menu)statements.push(DB.prepare("INSERT INTO menu_items(id,name,category,note,price,image_key,available,sort_order,updated_at) VALUES(?,?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,note=excluded.note,price=excluded.price,image_key=excluded.image_key,available=excluded.available,sort_order=excluded.sort_order,updated_at=datetime('now')").bind(item.id,item.name,item.category,item.note,item.price||null,item.image_key,item.available?1:0,item.sort_order));
  for(const row of oldMenu.results as Array<{id:string}>){if(!menuIds.has(row.id))statements.push(DB.prepare("DELETE FROM menu_items WHERE id=?").bind(row.id));}
  for(const review of input.reviews)statements.push(DB.prepare("INSERT INTO reviews(id,reviewer_name,rating,review_text,image_key,source,published,sort_order,updated_at) VALUES(?,?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(id) DO UPDATE SET reviewer_name=excluded.reviewer_name,rating=excluded.rating,review_text=excluded.review_text,image_key=excluded.image_key,source=excluded.source,published=excluded.published,sort_order=excluded.sort_order,updated_at=datetime('now')").bind(review.id,review.reviewer_name,review.rating,review.review_text,review.image_key,review.source,review.published?1:0,review.sort_order));
  for(const row of oldReviews.results as Array<{id:string}>){if(!reviewIds.has(row.id))statements.push(DB.prepare("DELETE FROM reviews WHERE id=?").bind(row.id));}
  statements.push(DB.prepare("INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=datetime('now')").bind("google_rating",input.settings.rating.toFixed(1)));
  statements.push(DB.prepare("INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=datetime('now')").bind("google_review_count",String(input.settings.review_count)));
  for(const booking of input.bookings)statements.push(DB.prepare("UPDATE bookings SET status=? WHERE id=?").bind(booking.status,booking.id));
  if(statements.length)await DB.batch(statements);
  if(STORAGE){
    const keepMenu=new Set(input.menu.flatMap(x=>x.image_key?[x.image_key]:[]));
    const keepReviews=new Set(input.reviews.flatMap(x=>x.image_key?[x.image_key]:[]));
    const removes:string[]=[];
    for(const row of oldMenu.results as Array<{id:string;image_key:string|null}>){if(row.image_key&&!menuIds.has(row.id))removes.push("menu/"+row.image_key);else if(row.image_key&&!keepMenu.has(row.image_key))removes.push("menu/"+row.image_key);}
    for(const row of oldReviews.results as Array<{id:string;image_key:string|null}>){if(row.image_key&&!reviewIds.has(row.id))removes.push(row.image_key);else if(row.image_key&&!keepReviews.has(row.image_key))removes.push(row.image_key);}
    await Promise.all(Array.from(new Set(removes)).map(key=>STORAGE.delete(key)));
  }
  return Response.json({ok:true});
}}}});
