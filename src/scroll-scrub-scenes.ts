import type { ScrollScrubScene, ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#E27A63",
  background: "#123B36",
  ink: "#F3F6EF",
  muted: "#C8D8D0",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    id: "scene-01",
    label: "THE FIRST PLATE",
    poster: "/assets/world/scene-01-poster.jpg",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    clip: "/assets/world/scene-01.mp4",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    title: "Bille Di Hatti",
    body: "A North Indian breakfast stop at 72D, Kamla Nagar, with chole poori, bhature, lassi, and the everyday energy of the market around it.",
    kicker: "KAMLA NAGAR, DELHI",
    tags: ["Vegetarian", "Breakfast", "Takeaway"],
    align: "left",
    scroll: 2.2,
    linger: 0.18,
    objectPosition: "50% 50%",
    mobileObjectPosition: "50% 55%",
  },
];
