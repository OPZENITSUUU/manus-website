import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

const PHONE="+918368283471";
const PHONE_LABEL="+91 83682 83471";
const ADDRESS="72D, Kamla Nagar, Delhi 110007, India";
const MAP_URL="https://www.google.com/maps/dir/?api=1&destination=72D%2C%20Kamla%20Nagar%2C%20Delhi%20110007%2C%20India";
const WA_URL="https://wa.me/918368283471?text=Hi%20Bille%20Di%20Hatti%2C%20I%27d%20like%20to%20make%20a%20booking%20enquiry.";

type MenuItem={id:string;name:string;category:string;note:string;price:string|null;image_key:string|null;available:number;sort_order:number};
type Review={id:string;reviewer_name:string;rating:number|null;review_text:string;image_key:string|null;source:string};
type ReviewPayload={rating:string;review_count:string};
function reviewStars(rating:number){return "★".repeat(rating)+"☆".repeat(5-rating);}

const fallbackMenu:MenuItem[]=[
{id:"1",name:"Chole Poori",category:"Popular plates",note:"Crisp poori with spiced chole.",price:null,image_key:null,available:1,sort_order:1},
{id:"2",name:"Meethi Lassi",category:"Drinks",note:"Sweet lassi.",price:null,image_key:null,available:1,sort_order:2},
{id:"3",name:"Aloo Sabji",category:"Sides",note:"Aloo sabji.",price:null,image_key:null,available:1,sort_order:3},
{id:"4",name:"Samosa",category:"Snacks",note:"Classic samosa.",price:null,image_key:null,available:1,sort_order:4},
{id:"5",name:"Gulab Jamun",category:"Sweet",note:"Gulab jamun.",price:null,image_key:null,available:1,sort_order:5},
{id:"6",name:"Dal Kachori",category:"Snacks",note:"Dal-filled kachori.",price:null,image_key:null,available:1,sort_order:6}
];

export const Route=createFileRoute("/")({component:Home});

function Home(){
 const [menu,setMenu]=useState<MenuItem[]>(fallbackMenu);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [reviewSummary,setReviewSummary]=useState<ReviewPayload>({rating:"4.0",review_count:"5052"});
 const bookingRef=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  Promise.all([
   fetch("/api/menu",{credentials:"same-origin"}).then(r=>r.ok?r.json():Promise.reject(new Error("menu"))),
   fetch("/api/reviews",{credentials:"same-origin"}).then(r=>r.ok?r.json():Promise.reject(new Error("reviews")))
  ]).then(([menuBody,reviewsBody])=>{
   if(Array.isArray(menuBody.items))setMenu(menuBody.items);
   if(Array.isArray(reviewsBody.reviews))setReviews(reviewsBody.reviews);
   if(reviewsBody.settings)setReviewSummary(reviewsBody.settings);
  }).catch(()=>{});
 },[]);

 const categories=Array.from(new Set(menu.filter(i=>i.available).map(i=>i.category)));

 return <main className="bdh-site">
  <header className="bdh-nav">
   <a className="bdh-brand" href="#top" aria-label="Bille Di Hatti home"><img className="bdh-logo" src="/assets/brand/bille-di-hatti-logo.jpg" alt="Bille Di Hatti logo" /><span>Bille Di Hatti</span></a>
   <nav aria-label="Primary"><a href="#about">About</a><a href="#menu">Menu</a><a href="#reviews">Reviews</a><a href="#visit">Visit</a></nav>
   <a className="bdh-nav-cta" href={"tel:"+PHONE}>Call {PHONE_LABEL}</a>
  </header>

  <section id="top" className="bdh-hero">
   <div className="bdh-hero-video" aria-hidden="true"><video autoPlay muted loop playsInline poster="/assets/world/scene-01-poster.jpg" preload="metadata"><source src="/assets/world/scene-01.mp4" type="video/mp4" media="(min-width:861px)"/><source src="/assets/world/scene-01-mobile.mp4" type="video/mp4" media="(max-width:860px)"/></video></div>
   <div className="bdh-hero-scrim"/>
   <div className="bdh-hero-copy"><p className="bdh-kicker">72D · KAMLA NAGAR</p><p className="bdh-hero-title">Bille Di Hatti</p><p className="bdh-lead">Chole poori, bhature, lassi and a distinctly Delhi breakfast rhythm.</p><div className="bdh-hero-actions"><a href="#menu" className="bdh-cta bdh-cta-coral">View the menu <span>↓</span></a><a href={MAP_URL} target="_blank" rel="noreferrer" className="bdh-cta bdh-cta-light">Get directions</a></div></div>
   <div className="bdh-scroll-note">Scroll the story <span>↘</span></div>
  </section>

  <section className="bdh-journey" aria-label="Interactive food story"><ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme}/></section>

  <section className="bdh-about bdh-section" id="about">
   <div className="bdh-about-image"><img src="/assets/gallery/bille-di-hatti-kamla-nagar-storefront.jpg" alt="Bille Di Hatti storefront in Kamla Nagar" loading="lazy"/></div>
   <div className="bdh-about-copy"><p className="bdh-kicker">THE PLACE</p><h2>Breakfast at a Kamla Nagar address.</h2><p>Bille Di Hatti is a vegetarian North Indian restaurant at 72D, Kamla Nagar, Delhi. Public listings associate the outlet with breakfast, street food, takeaway and familiar North Indian favourites.</p><p>The practical details stay front and center, from opening hours and phone contact to directions and booking enquiries.</p><div className="bdh-fact-row"><div><strong>{reviewSummary.rating} / 5</strong><span>Google rating · {reviewSummary.review_count} reviews</span></div><div><strong>7:00 AM</strong><span>Current listed opening time</span></div><div><strong>VEG</strong><span>Vegetarian only</span></div></div></div>
  </section>

  <section className="bdh-menu bdh-section" id="menu">
   <div className="bdh-menu-head"><div><p className="bdh-kicker">THE MENU</p><h2>Familiar plates, sharply presented.</h2></div><p>Popular items shown in current public listings. Prices and dish photos on this page are loaded from the admin-managed live menu.</p></div>
   <div className="bdh-menu-grid">{categories.map((category,cIndex)=>{const items=menu.filter(i=>i.available&&i.category===category);const featured=items.find(i=>i.image_key);const image=featured?.image_key?"/api/menu-image?key="+encodeURIComponent(featured.image_key):(cIndex%2===0?"/assets/gallery/chole-platter.jpg":"/assets/gallery/poori-platter.jpg");return <article className={"bdh-menu-card card-"+(cIndex%3)} key={category}><div className="bdh-menu-photo"><img src={image} alt={category+" from Bille Di Hatti"} loading="lazy"/></div><div className="bdh-menu-meta"><span>{category}</span><span>{items.length} items</span></div><ul>{items.slice(0,5).map(item=><li key={item.id}><strong>{item.name}{item.price?<small>₹{item.price}</small>:null}</strong><span>{item.note}</span></li>)}</ul></article>;})}</div>
  </section>

  <section className="bdh-reviews bdh-section" id="reviews">
   <div className="bdh-review-intro"><p className="bdh-kicker">DINER REVIEWS</p><h2>Real review notes, kept current.</h2><div className="bdh-review-summary"><strong>{reviewSummary.rating}</strong><span>/ 5</span><small>{reviewSummary.review_count} Google reviews</small></div><p className="bdh-muted">Published review content and photos are managed from the private admin panel.</p></div>
   <div className="bdh-review-stack">{reviews.length===0?<div className="bdh-review-empty">No published reviews yet.</div>:reviews.map(review=><figure key={review.id}><div className="bdh-review-top">{review.image_key?<img src={"/api/review-image?key="+encodeURIComponent(review.image_key)} alt={review.reviewer_name} loading="lazy"/>:<span className="bdh-review-avatar">{review.reviewer_name.slice(0,1).toUpperCase()}</span>}<div><strong>{review.reviewer_name}</strong><span>{review.source||"Review"}</span>{review.rating!==null&&<span className="bdh-stars" aria-label={review.rating+" out of 5 stars"}>{reviewStars(review.rating)}</span>}</div></div><blockquote>{review.review_text}</blockquote></figure>)}</div>
  </section>

  <section className="bdh-visit bdh-section" id="visit">
   <div className="bdh-visit-panel"><div><p className="bdh-kicker">PLAN THE VISIT</p><h2>Come hungry. Keep the address handy.</h2><p>For the Kamla Nagar outlet, public listings show daily opening from 7:00 AM. The booking form sends the enquiry to WhatsApp so the restaurant can handle final confirmation.</p></div><div className="bdh-hours"><div><span>Monday-Sunday</span><strong>7:00 AM - 6:00 PM</strong></div><div><span>Phone</span><strong><a href={"tel:"+PHONE}>{PHONE_LABEL}</a></strong></div><div><span>Address</span><strong>{ADDRESS}</strong></div></div><div className="bdh-visit-actions"><a href={WA_URL} target="_blank" rel="noreferrer" className="bdh-cta bdh-cta-seafoam">WhatsApp booking</a><button type="button" className="bdh-cta bdh-cta-outline" onClick={()=>bookingRef.current?.scrollIntoView({behavior:"smooth"})}>Book a table</button></div></div>
   <div className="bdh-booking" ref={bookingRef}><BookingForm/></div>
   <div className="bdh-map"><a href={MAP_URL} target="_blank" rel="noreferrer" className="bdh-map-card"><span className="bdh-map-pin">⌖</span><div><strong>72D, Kamla Nagar</strong><span>Open directions in Google Maps</span></div><span>↗</span></a></div>
  </section>

  <footer className="bdh-footer"><div><a className="bdh-brand" href="#top"><img className="bdh-logo" src="/assets/brand/bille-di-hatti-logo.jpg" alt="Bille Di Hatti logo" /><span>Bille Di Hatti</span></a><p>North Indian restaurant · Kamla Nagar · Delhi</p></div><div className="bdh-footer-links"><a href={"tel:"+PHONE}>Call</a><a href={MAP_URL} target="_blank" rel="noreferrer">Directions</a><a href={WA_URL} target="_blank" rel="noreferrer">WhatsApp</a></div></footer>
 </main>;
}

function BookingForm(){
 const [status,setStatus]=useState("");
 async function submit(form:HTMLFormElement){
  const data=Object.fromEntries(new FormData(form).entries());
  const response=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(data)});
  if(!response.ok){setStatus("Booking could not be saved. Please call the restaurant.");return;}
  const msg="Hi Bille Di Hatti, I would like to make a booking enquiry. Name: "+data.name+", Phone: "+data.phone+", Date: "+data.date+", Time: "+data.time+", Guests: "+data.guests;
  setStatus("Request saved. Opening WhatsApp...");
  window.open("https://wa.me/918368283471?text="+encodeURIComponent(msg),"_blank","noopener,noreferrer");
  form.reset();
 }
 return <form className="bdh-booking-form" onSubmit={e=>{e.preventDefault();void submit(e.currentTarget);}}>
  <div><label htmlFor="booking-name">Name</label><input id="booking-name" name="name" autoComplete="name" required/></div>
  <div><label htmlFor="booking-phone">Phone</label><input id="booking-phone" name="phone" inputMode="tel" autoComplete="tel" required/></div>
  <div><label htmlFor="booking-date">Date</label><input id="booking-date" name="date" type="date" required/></div>
  <div><label htmlFor="booking-time">Time</label><input id="booking-time" name="time" type="time" required/></div>
  <div><label htmlFor="booking-guests">Guests</label><input id="booking-guests" name="guests" type="number" min="1" max="20" defaultValue="2" required/></div>
  <button type="submit" className="bdh-cta bdh-cta-coral">Send booking request</button>{status&&<p className="bdh-form-status" role="status">{status}</p>}
 </form>;
}
