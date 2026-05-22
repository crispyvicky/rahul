import people1 from "./assets/img/what_people1.avif";
import people2 from "./assets/img/what_people2.avif";
import people3 from "./assets/img/what_people3.avif";

//gym img
// imports removed
//blog
import blog1 from "./assets/img/blog1.avif";
import blog2 from "./assets/img/blog2.avif";
import blog3 from "./assets/img/blog3.avif";

// user blog
import b_user1 from "./assets/img/b_user1.avif";
import b_user2 from "./assets/img/b_user2.avif";
import b_user3 from "./assets/img/b_user3.avif";

import rfLogo from "./assets/img/RF.png";

export const testimonialData = [
  {
    name: "Aryan Sharma",
    role: "Athlete",
    comment:
      "The RahulFitzz Blueprint didn't just change my physique; it rewired my discipline. The most structured program I've ever followed.",
    rating: 5,
    imageUrl: people1,
  },
  {
    name: "Vikram Malhotra",
    role: "Professional",
    comment:
      "Rahul's focus on mobility changed the game for me. I'm lifting heavier than ever without the nagging pains I used to have.",
    rating: 5,
    imageUrl: people2,
  },
  {
    name: "Rohan Gupta",
    role: "Fitness Enthusiast",
    comment:
      "The community support and Rahul's direct approach are unmatched. This isn't just a gym app; it's an elite performance hub.",
    rating: 5,
    imageUrl: people3,
  },
];

export const faqs = [
  {
    question: "Who is the 'RahulFitzz' Blueprint designed for?",
    answer:
      "The Blueprint is engineered for the high-performance athlete. Whether you are starting from zero or a seasoned pro, my system provides the scientific hierarchy required for absolute physical evolution.",
  },
  {
    question: "How do the Official Pro-Training Hubs operate?",
    answer:
      "These are vetted, elite-tier facilities equipped with the specific hardware required to execute my high-intensity hypertrophy and mobility protocols. They are currently expanding globally.",
  },
  {
    question: "Is nutrition precision-engineered for every plan?",
    answer:
      "Absolutely. No more guessing. Every Blueprint program includes comprehensive nutritional frameworks calibrated to your specific metabolic engine, ensuring every calorie fuels your peak condition.",
  },
  {
    question: "What defines the 'Iron Mindset' in the programs?",
    answer:
      "Discipline is our core currency. The Iron Mindset isn't just about weight; it's about the psychological framework required to maintain peak focus when the initial motivation fades.",
  },
  {
    question: "Can I access the digital vault from any device?",
    answer:
      "Yes. The Blueprint digital vault is built for the modern athlete, providing 24/7 access to your training splits, metrics, and technical coaching tutorials from any mobile interface.",
  },
];

export const gyms = [
  {
    id: "1",
    name: "RahulFitzz Performance HQ",
    image: "/placeholder.png",
    phone: "+91 88888 88888",
    address: "Nerul Elite Sector, Navi Mumbai",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d15086.84530312852!2d73.016683!3d19.032438!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTnCsDAxJzU2LjgiTiA3M8KwMDEnMDAuMSJF!5e0!3m2!1sen!2sus!4v1734459176276!5m2!1sen!2sus",
  },
  {
    id: "2",
    name: "Titan Elite Training Zone",
    image: "/placeholder.png",
    phone: "+91 77777 77777",
    address: "Seawoods Iron District, Navi Mumbai",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d15084.925421058208!2d73.065921!3d19.053563!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTnCsDAzJzEyLjgiTiA3M8KwMDMnNTcuMyJF!5e0!3m2!1sen!2sus!4v1734459256729!5m2!1sen!2sus",
  },
  {
    id: "3",
    name: "The Iron Sanctum",
    image: "/placeholder.png",
    phone: "+91-22-9999-1111",
    address: "Belapur Powerhouse, Navi Mumbai",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d15955.44999535032!2d36.693236!3d-1.254175!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMTUnMTUuMCJTIDM2wrA0MSczNS43IkU!5e0!3m2!1sen!2sus!4v1734459317198!5m2!1sen!2sus",
  },
];

export const blogData = [
  {
    id: 1,
    isLarge: true,
    title: "The RahulFitzz Blueprint: Complete 12-Week Transformation Guide",
    date: "Jun 28, 2024",
    author: "RahulFitzz",
    category: "Transformation",
    btnColor: "bg-[#eb0000]",
    imageUrl: blog1,
    b_user: b_user1,
    content: "Transforming your physique requires more than just sweat; it requires a calculated blueprint. In this guide, I break down the exact hypertrophy protocols and metabolic conditioning sessions that took me from standard to standout. Learn how to structure your training blocks, optimize your nutrient timing, and why consistency in the 'boring' basics is your greatest weapon for an elite body."
  },
  {
    id: 2,
    title: "Scientific Fasting: Peak Performance Year-Round",
    date: "Jun 28, 2024",
    author: "RahulFitzz",
    btnColor: "bg-[#eb0000]",
    category: "Nutrition",
    imageUrl: blog2,
    b_user: b_user2,
    content: "Maintaining a shredded physique while building strength is the ultimate puzzle. Discover how I use intermittent fasting not just for fat loss, but for heightened mental clarity and growth hormone optimization. We dive into the science of autophagy, insulin sensitivity, and how to fuel your high-intensity sessions without breaking the fast prematurely."
  },

  {
    id: 3,
    title: "Iron Mindset: Why Discipline Beats Motivation",
    date: "Jun 23, 2024",
    author: "RahulFitzz",
    category: "Mindset",
    btnColor: "bg-[#eb0000] ",
    imageUrl: blog3,
    b_user: b_user3,
    content: "Motivation is a feeling; discipline is a decision. In this editorial, I share the psychological frameworks I use to stay focused when the initial excitement fades. From building unshakeable habits to mastering delayed gratification, learn how to audit your mindset and cultivate the mental toughness required to join the RahulFitzz elite community."
  },
];

export const activities = [
  { activity: "Social Media", text: "MEDIA REACH", imageUrl: "/portfolio-bodybuilder.png" },
  { activity: "Collaboration", text: "PARTNERSHIPS", imageUrl: "/portfolio-deadlift.png" },
  { activity: "Production", text: "CONTENT STRATEGY", imageUrl: "/portfolio-group.png" },
  { activity: "Community", text: "ENGAGEMENT", imageUrl: "/portfolio-bike.jpg" },
  { activity: "Impact", text: "GLOBAL REACH", imageUrl: "/q.png" },
];

export const features = [
  {
    icon: "https://framerusercontent.com/images/rxSlFR0RyaC3WCayigHX4RPQZs.svg",
    title: "METABOLIC PRECISION",
    description:
      "Stop guessing. Every rep, every set, every calorie is aligned with your body. This is data-driven training designed to maximize muscle growth and performance—no fluff, no shortcuts.",
  },
  {
    icon: "https://framerusercontent.com/images/u8fjSIAgWQzhagulXkIoN7PzI.svg",
    title: "UNSHAKEABLE DISCIPLINE",
    description:
      "Motivation fades. Systems don’t. Build habits that create consistency, and consistency that builds results. This is where average ends and elite begins.",
  },
  {
    icon: "https://framerusercontent.com/images/AjjAxBc5v6SZHOkJzG2bwrSMk.svg",
    title: "THE BLUEPRINT VAULT",
    description:
      "Access the exact training frameworks, hypertrophy techniques, and recovery protocols used to build a powerful, aesthetic physique.",
  },
  {
    icon: "https://framerusercontent.com/images/pvxqwt0ZG86WIRPPnHxDCgV7rkQ.svg",
    title: "ELITE MACRO ENGINEERING",
    description:
      "Your nutrition is your edge. Dialed-in macros, performance fueling, and recovery-focused eating—structured to match your training and accelerate results.",
  },
];

export const levels_list = [
  {
    title: "THE RECRUIT",
    description:
      "Build the foundation of strength and discipline with entry-level Blueprint routines.",
    image: people1,
  },
  {
    title: "THE WARRIOR",
    description: "Escalate the intensity with advanced volume and targeted hypertrophy splits.",
    image: people2,
  },
  {
    title: "THE ELITE",
    description: "Push beyond human limits with high-frequency, professional-grade training protocols.",
    image: people3,
  },
  {
    title: "CUSTOM BLUEPRINT",
    description: "Direct elite coaching integration for your specific competition or lifestyle goals.",
    image: rfLogo,
  },
];
