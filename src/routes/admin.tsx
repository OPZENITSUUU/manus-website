import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

type MenuItem={id:string;name:string;category:string;note:string;price:string|null;image_key:string|null;available:number;sort_order:number};
type Booking={id:string;name:string;phone:string;date:string;time:string;guests:number;status:string;created_at:string};
type Review={id:string;reviewer_name:string;rating:number|null;review_text:string;image_key:string|null;source:string;published:number;sort_order:number};

export const Route=createFileRoute("/admin")({component:Admin});

function Admin(){
 const [configured,setConfigured]=useState<boolean|null>(null);
 const [loggedIn,setLoggedIn]=useState(false);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [items,setItems]=useState<MenuItem[]>([]);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [rating,setRating]=useState("4.0");
 const [reviewCount,setReviewCount]=useState("5052");
 const [emailStage,setEmailStage]=useState<"idle"|"edit"|"sent"|"verified">("idle");
 const [newEmail,setNewEmail]=useState("");
 const [emailCode,setEmailCode]=useState("");
 const [newReview,setNewReview]=useState({reviewer_name:"",rating:"",review_text:"",source:"Google review",published:true,image_key:null as string|null});
 const [status,setStatus]=useState("");
 const [working,setWorking]=useState(false);
 const [pending,setPending]=useState(false);
 const [resetStage,setResetStage]=useState<"idle"|"sent"|"verified">("idle");
 const [code,setCode]=useState("");
 const [newPassword,setNewPassword]=useState("");
 const [confirm,setConfirm]=useState("");

 async function refresh(){
  try{
   const me=await fetch("/api/admin/me",{credentials:"include"});
   const body=await me.json().catch(()=>({}));
   setConfigured(body.configured!==false);
   setLoggedIn(body.ok===true);
   if(body.ok){
    setEmail(body.email);
    const [m,b,r]=await Promise.all([
      fetch("/api/admin/menu",{credentials:"include"}),
      fetch("/api/admin/bookings",{credentials:"include"}),
      fetch("/api/admin/reviews",{credentials:"include"})
    ]);
    const [mb,bb,rb]=await Promise.all([m.json().catch(()=>({})),b.json().catch(()=>({})),r.json().catch(()=>({}))]);
    setItems(Array.isArray(mb.items)?mb.items:[]);
    setBookings(Array.isArray(bb.items)?bb.items:[]);
    setReviews(Array.isArray(rb.reviews)?rb.reviews:[]);
    if(rb.settings){setRating(String(rb.settings.google_rating||"4.0"));setReviewCount(String(rb.settings.google_review_count||"5052"));}
    setPending(false);
   }
  }catch{
   setStatus("Could not load admin status.");
  }
 }
 useEffect(()=>{void refresh();},[]);

 async function login(e:React.FormEvent){
  e.preventDefault();
  setWorking(true);setStatus("");
  const r=await fetch("/api/admin/login",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const body=await r.json().catch(()=>({}));
  setWorking(false);
  if(!body.ok){
   setStatus(body.code==="rate_limited"?"Too many attempts. Try later.":body.code==="invalid_credentials"?"Invalid Gmail or password.":"Admin account is not configured yet.");
   return;
  }
  setPassword("");setLoggedIn(true);setEmail(body.email);await refresh();
 }
 async function logout(){
  await fetch("/api/admin/logout",{method:"POST",credentials:"include"});
  setLoggedIn(false);setItems([]);setBookings([]);setReviews([]);setPending(false);setStatus("");
 }
 function markPending(message?:string){setPending(true);if(message)setStatus(message);}
 function save(item:MenuItem){setItems(prev=>prev.map(x=>x.id===item.id?item:x));markPending("Menu change staged. Press DONE to publish.");}
 function remove(id:string){setItems(prev=>prev.filter(x=>x.id!==id));markPending("Dish removal staged. Press DONE to publish.");}
 async function photo(id:string,file:File){setWorking(true);const form=new FormData();form.append("id",id);form.append("file",file);const r=await fetch("/api/admin/menu-photo?draft=1",{method:"POST",credentials:"include",body:form});const body=await r.json().catch(()=>({}));setWorking(false);if(body.ok){setItems(prev=>prev.map(x=>x.id===id?{...x,image_key:body.key}:x));markPending("Dish photo staged. Press DONE to publish.");}else setStatus("Photo update failed.");}
 async function bookingStatus(id:string,next:string){setBookings(prev=>prev.map(b=>b.id===id?{...b,status:next}:b));markPending("Booking status staged. Press DONE to publish.");}
 function saveReview(review:Review){setReviews(prev=>prev.map(x=>x.id===review.id?review:x));markPending("Review change staged. Press DONE to publish.");}
 async function reviewPhoto(id:string,file:File){setWorking(true);const form=new FormData();form.append("id",id);form.append("file",file);const r=await fetch("/api/admin/review-photo?draft=1",{method:"POST",credentials:"include",body:form});const body=await r.json().catch(()=>({}));setWorking(false);if(body.ok){setReviews(prev=>prev.map(x=>x.id===id?{...x,image_key:body.key}:x));markPending("Review photo staged. Press DONE to publish.");}else setStatus("Review photo update failed.");}
 function removeReview(id:string){setReviews(prev=>prev.filter(x=>x.id!==id));markPending("Review removal staged. Press DONE to publish.");}
 async function newReviewPhoto(file:File){setWorking(true);const form=new FormData();const id="draft-review-"+crypto.randomUUID();form.append("id",id);form.append("file",file);const r=await fetch("/api/admin/review-photo?draft=1",{method:"POST",credentials:"include",body:form});const body=await r.json().catch(()=>({}));setWorking(false);if(body.ok){setNewReview(prev=>({...prev,image_key:body.key}));setStatus("Review photo staged. Finish the review and press Add to draft.");}else setStatus("Review photo upload failed.");}
 async function addReview(){const text=newReview.review_text.trim();if(!newReview.reviewer_name.trim()||!text){setStatus("Reviewer name and review text are required.");return;}const review:Review={id:crypto.randomUUID(),reviewer_name:newReview.reviewer_name.trim(),rating:newReview.rating?Number(newReview.rating):null,review_text:text,image_key:newReview.image_key,source:newReview.source.trim(),published:newReview.published?1:0,sort_order:reviews.length+1};setReviews(prev=>[...prev,review]);setNewReview({reviewer_name:"",rating:"",review_text:"",source:"Google review",published:true,image_key:null});markPending("Review added to the draft. Press DONE to publish.");}
 function saveRating(){const value=Number(rating),count=Number(reviewCount);if(!Number.isFinite(value)||value<0||value>5||!Number.isInteger(count)||count<0){setStatus("Enter a valid rating and review count.");return;}markPending("Rating summary staged. Press DONE to publish.");}
 async function saveAll(){if(!pending)return;setWorking(true);setStatus("");const payload={menu:items,reviews,settings:{rating:Number(rating),review_count:Number(reviewCount)},bookings:bookings.map(b=>({id:b.id,status:b.status}))};const r=await fetch("/api/admin/publish",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const body=await r.json().catch(()=>({}));setWorking(false);if(!body.ok){setStatus(body.code==="invalid_payload"?"Some draft data is invalid. Check the fields and try again.":"Could not publish the changes. Nothing was marked done.");return;}setPending(false);setStatus("DONE. All staged website changes are now live.");await refresh();}
 async function requestEmailChange(){
  if(!/^[^@\s]+@gmail\.com$/i.test(newEmail.trim())){setStatus("The new admin Gmail must be a Gmail address.");return;}
  setWorking(true);setStatus("");const r=await fetch("/api/admin/email-change-request-code",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({newEmail})});const body=await r.json().catch(()=>({}));setWorking(false);
  if(body.ok){setEmailStage("sent");setStatus("Code sent to the current Gmail: "+email+".");}else setStatus(body.code==="cooldown"?"Please wait a minute before requesting another code.":body.code==="same_email"?"That is already the registered Gmail.":body.code==="email_not_configured"?"Gmail code delivery is not configured yet.":"Could not start the Gmail change.");
 }
 async function verifyEmail(){const r=await fetch("/api/admin/email-change-verify-code",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:emailCode})});const body=await r.json().catch(()=>({}));if(body.ok){setEmailStage("verified");setStatus("Current Gmail verified. You can now switch the admin Gmail.");}else setStatus("Invalid or expired code.");}
 async function changeEmail(){const r=await fetch("/api/admin/email-change",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({newEmail})});const body=await r.json().catch(()=>({}));if(body.ok){setLoggedIn(false);setEmailStage("idle");setEmailCode("");setStatus("Admin Gmail changed. Log in again with the new Gmail.");}else setStatus("Gmail change verification has expired. Start again.");}

 async function sendCode(){
  setWorking(true);setStatus("");
  const r=await fetch("/api/admin/password-request-code",{method:"POST",credentials:"include"});
  const body=await r.json().catch(()=>({}));
  setWorking(false);
  if(body.ok){setResetStage("sent");setStatus("Verification code sent to "+email+".");}
  else setStatus("Gmail code delivery is not configured yet.");
 }
 async function verify(){
  const r=await fetch("/api/admin/password-verify-code",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
  const body=await r.json().catch(()=>({}));
  if(body.ok){setResetStage("verified");setStatus("Verified. Set your new password.");}
  else setStatus("Invalid or expired code.");
 }
 async function changePassword(){
  const r=await fetch("/api/admin/password-change",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:newPassword,confirmPassword:confirm})});
  const body=await r.json().catch(()=>({}));
  if(body.ok){setLoggedIn(false);setResetStage("idle");setCode("");setNewPassword("");setConfirm("");setStatus("Password changed. Log in again.");}
  else setStatus("Use matching passwords with at least 10 characters.");
 }

 if(!loggedIn)return <main className="bdh-auth-shell"><div className="bdh-auth-card">
  <div className="bdh-auth-brand"><img className="bdh-logo" src="/assets/brand/bille-di-hatti-logo.jpg" alt="Bille Di Hatti logo" /><span>Bille Di Hatti</span></div>
  <p className="bdh-kicker">ADMIN ACCESS</p><h1>Control the menu.</h1>
  <p>Sign in with the registered Gmail address and admin password.</p>
  {configured===false&&<div className="bdh-admin-alert"><strong>First-time setup required.</strong><span>Configure the admin Gmail and initial password in the website secret settings before the first login. Gmail password-reset emails also need the mail provider settings.</span><code>ADMIN_EMAIL · ADMIN_INITIAL_PASSWORD · RESEND_API_KEY · MAIL_FROM</code></div>}
  <form onSubmit={login} className="bdh-auth-form">
   <label>Gmail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com" autoComplete="username" required/></label>
   <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>
   <button className="bdh-cta bdh-cta-coral" disabled={working}>{working?"Checking...":"Enter admin panel"}</button>
  </form>
  {status&&<p className="bdh-form-status">{status}</p>}
  <a className="bdh-back-link" href="/">← Back to website</a>
 </div></main>;

 return <main className="bdh-admin">
  <div className="bdh-admin-top">
   <a href="/" className="bdh-brand"><img className="bdh-logo" src="/assets/brand/bille-di-hatti-logo.jpg" alt="Bille Di Hatti logo" /><span>Bille Di Hatti</span></a>
   <div className="bdh-admin-user"><span>{email}</span><button onClick={logout}>Log out</button></div>
  </div>

  <section className="bdh-admin-hero">
   <div><p className="bdh-kicker">CONTROL ROOM</p><h1>Keep the public menu current.</h1><p>Price edits, availability changes and dish photos are saved to the same live content store that the public page reads.</p></div>
   <div className="bdh-security-card"><strong>One-owner admin</strong><span>Only one Gmail can be active. Any Gmail change must be approved by a code sent to the current Gmail.</span><button className="bdh-mini-btn" onClick={()=>{setEmailStage(emailStage==="idle"?"edit":"idle");}} disabled={working}>{emailStage==="idle"?"Change admin Gmail":"Close email change"}</button><button className="bdh-mini-btn" onClick={()=>void sendCode()} disabled={working}>Change password</button></div>
  </section>

  {emailStage!=="idle"&&<section className="bdh-security-flow"><strong>Change the only admin Gmail</strong><p>Current Gmail: <b>{email}</b></p>{emailStage==="edit"&&<div className="bdh-inline"><input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="newowner@gmail.com"/><button className="bdh-cta bdh-cta-coral" onClick={()=>void requestEmailChange()}>Send code to current Gmail</button></div>}{emailStage==="sent"&&<><div className="bdh-inline"><input value={newEmail} readOnly/><span className="bdh-code-note">Code sent to current Gmail</span></div><div className="bdh-inline"><input inputMode="numeric" maxLength={6} value={emailCode} onChange={e=>setEmailCode(e.target.value.replace(/\D/g,""))} placeholder="000000"/><button className="bdh-mini-btn" onClick={()=>void verifyEmail()}>Verify current Gmail</button></div></>}{emailStage==="verified"&&<div className="bdh-inline"><input value={newEmail} readOnly/><button className="bdh-cta bdh-cta-coral" onClick={()=>void changeEmail()}>Switch admin Gmail</button></div>}</section>}

  {resetStage!=="idle"&&<section className="bdh-password-flow">
   {resetStage==="sent"&&<><strong>1. Verify Gmail code</strong><p>Enter the six-digit code sent to {email}.</p><div className="bdh-inline"><input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} placeholder="000000"/><button className="bdh-cta bdh-cta-coral" onClick={()=>void verify()}>Verify</button></div></>}
   {resetStage==="verified"&&<><strong>2. Set a new password</strong><div className="bdh-inline"><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password"/><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password"/><button className="bdh-cta bdh-cta-coral" onClick={()=>void changePassword()}>Change password</button></div></>}
  </section>}

  {status&&<p className="bdh-form-status bdh-admin-message">{status}</p>}

  <section className="bdh-admin-card">
   <div className="bdh-admin-card-head"><div><p className="bdh-kicker">MENU MANAGEMENT</p><h2>Draft menu</h2></div><span>{items.length} items</span></div>
   <div className="bdh-admin-table">{items.map((item,index)=><MenuEditor key={item.id} item={{...item,sort_order:index}} disabled={working} onSave={save} onDelete={remove} onPhoto={photo}/>)}</div>
  </section>

  <section className="bdh-admin-card"><div className="bdh-admin-card-head"><div><p className="bdh-kicker">REVIEWS + RATINGS</p><h2>Public review wall</h2></div><span>{reviews.length} saved</span></div>
   <div className="bdh-review-settings"><div><label>Displayed rating<input inputMode="decimal" value={rating} onChange={e=>{setRating(e.target.value);markPending();}}/></label><label>Displayed review count<input inputMode="numeric" value={reviewCount} onChange={e=>{setReviewCount(e.target.value.replace(/\D/g,""));markPending();}}/></label></div><p>These values appear in the public rating summary. Keep them aligned with the source you use.</p></div>
   <div className="bdh-review-add"><h3>Add a review</h3><div className="bdh-review-form-grid"><input value={newReview.reviewer_name} onChange={e=>setNewReview({...newReview,reviewer_name:e.target.value})} placeholder="Reviewer name"/><select value={newReview.rating} onChange={e=>setNewReview({...newReview,rating:e.target.value})}><option value="">No rating</option><option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3">3 / 5</option><option value="4">4 / 5</option><option value="5">5 / 5</option></select><input value={newReview.source} onChange={e=>setNewReview({...newReview,source:e.target.value})} placeholder="Source"/><textarea value={newReview.review_text} onChange={e=>setNewReview({...newReview,review_text:e.target.value})} placeholder="Review text"/><label className="bdh-file-pick">Review photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.currentTarget.files?.[0];if(f)void newReviewPhoto(f);}}/></label><label className="bdh-check"><input type="checkbox" checked={newReview.published} onChange={e=>setNewReview({...newReview,published:e.target.checked})}/> Publish on website</label></div><button className="bdh-cta bdh-cta-coral" disabled={working} onClick={()=>void addReview()}>Add review</button></div>
   <div className="bdh-admin-review-list">{reviews.map(review=><ReviewEditor key={review.id} review={review} disabled={working} onSave={saveReview} onDelete={removeReview} onPhoto={reviewPhoto}/>)}</div>
  </section>

  <section className="bdh-admin-card">
   <div className="bdh-admin-card-head"><div><p className="bdh-kicker">BOOKINGS</p><h2>Recent enquiries</h2></div><span>{bookings.length}</span></div>
   {bookings.length===0?<p>No booking requests yet.</p>:bookings.slice(0,20).map(b=><div className="bdh-booking-row" key={b.id}><strong>{b.name}</strong><span>{b.date} · {b.time} · {b.guests} guests · {b.phone}</span><div className="bdh-booking-actions"><em>{b.status}</em>{b.status==="new"&&<><button onClick={()=>void bookingStatus(b.id,"confirmed")}>Confirm</button><button onClick={()=>void bookingStatus(b.id,"cancelled")}>Cancel</button></>}</div></div>)}
  </section>

  {pending&&<div className="bdh-done-bar"><span>Unsaved website changes</span><button onClick={()=>void saveAll()} disabled={working}>{working?"PUBLISHING...":"DONE"}</button></div>}
 </main>;
}

function MenuEditor({item,disabled,onSave,onDelete,onPhoto}:{item:MenuItem;disabled:boolean;onSave:(i:MenuItem)=>void;onDelete:(id:string)=>void;onPhoto:(id:string,f:File)=>void}){return <div className="bdh-admin-menu-row"><div className="bdh-admin-thumb">{item.image_key?<img src={"/api/menu-image?key="+encodeURIComponent(item.image_key)} alt=""/>:<span>BDH</span>}</div><div className="bdh-admin-menu-fields"><input value={item.name} aria-label="Dish name" onChange={e=>onSave({...item,name:e.target.value})}/><input value={item.category} aria-label="Category" onChange={e=>onSave({...item,category:e.target.value})}/><input value={item.price||""} aria-label="Price" inputMode="decimal" placeholder="Price" onChange={e=>onSave({...item,price:e.target.value||null})}/><input value={item.note} aria-label="Short note" placeholder="Short note" onChange={e=>onSave({...item,note:e.target.value})}/><label className="bdh-check"><input type="checkbox" checked={Boolean(item.available)} onChange={e=>onSave({...item,available:e.target.checked?1:0})}/> Visible on website</label></div><div className="bdh-admin-menu-actions"><label className="bdh-mini-btn">Change photo<input hidden type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void onPhoto(item.id,file);}}/></label><button className="bdh-mini-btn bdh-danger" disabled={disabled} onClick={()=>onDelete(item.id)}>Delete</button></div></div>}

function ReviewEditor({review,disabled,onSave,onDelete,onPhoto}:{review:Review;disabled:boolean;onSave:(r:Review)=>void;onDelete:(id:string)=>void;onPhoto:(id:string,f:File)=>void}){return <article className="bdh-admin-review-row"><div className="bdh-admin-review-media">{review.image_key?<img src={"/api/review-image?key="+encodeURIComponent(review.image_key)} alt=""/>:<span>REVIEW</span>}<label className="bdh-mini-btn">Change photo<input hidden type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void onPhoto(review.id,file);}}/></label></div><div className="bdh-admin-review-fields"><input value={review.reviewer_name} onChange={e=>onSave({...review,reviewer_name:e.target.value})} placeholder="Reviewer name"/><div className="bdh-admin-review-inline"><select value={review.rating===null?"":String(review.rating)} onChange={e=>onSave({...review,rating:e.target.value?Number(e.target.value):null})}><option value="">No rating</option><option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3">3 / 5</option><option value="4">4 / 5</option><option value="5">5 / 5</option></select><input value={review.source} onChange={e=>onSave({...review,source:e.target.value})} placeholder="Source"/></div><textarea value={review.review_text} onChange={e=>onSave({...review,review_text:e.target.value})} placeholder="Review text"/><label className="bdh-check"><input type="checkbox" checked={Boolean(review.published)} onChange={e=>onSave({...review,published:e.target.checked?1:0})}/> Publish on website</label><div className="bdh-admin-menu-actions"><button className="bdh-mini-btn bdh-danger" disabled={disabled} onClick={()=>onDelete(review.id)}>Delete</button></div></div></article>}
