import React from "react";
import { Mail, Dumbbell } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import logo from "../assets/img/RF.png";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-8 py-20 px-[5%] md:px-0 bg-[#050505] border-t border-white/5 w-full">
      <Logo />
      <h2 className="text-xl text-white font-black uppercase tracking-widest text-center" style={{ fontFamily: '"Orbitron", sans-serif' }}>
        RAHULFITZZ<span className="text-[#eb0000]">.</span>
      </h2>
      <ContactButton email="collab@rahulfitzz.com" />
      <Navigation />
      <F_bottom />
    </footer>
  );
}

const ContactButton = ({ email }: any) => {
  return (
    <a
      href={`mailto:${email}`}
      className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-[#eb0000] hover:border-[#eb0000] transition-all duration-300 group shrink-0"
    >
      <Mail className="w-5 h-5 text-[#eb0000] group-hover:text-white" />
      <span className="text-white font-bold tracking-widest uppercase text-sm">{email}</span>
    </a>
  );
};

const NavLink = ({ href, children }: any) => {
  return (
    <a
      href={href}
      className="text-[#96979c] hover:text-white font-bold text-xs uppercase tracking-widest transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#eb0000] hover:after:w-full after:transition-all"
    >
      {children}
    </a>
  );
};

const SocialLinks = () => {
  const socialLinks = [
    { Icon: faInstagram, href: "https://www.instagram.com/rahulfitzz", label: "instagram" },
    { Icon: faYoutube, href: "https://www.youtube.com/@rahulfitzz", label: "youtube" },
  ];

  return (
    <div className="flex gap-6 items-center justify-center">
      {socialLinks.map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex items-center justify-center text-[#96979c] hover:text-white transition-all duration-300 hover:scale-110"
        >
          <FontAwesomeIcon icon={Icon} className="w-6 h-6" />
        </a>
      ))}
    </div>
  );
};

const F_bottom = () => {
  return (
    <footer className="mt-auto py-6 border-t border-[#18181a] md:w-[90%] ">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row justify-between items-center">
        <p className="text-[#bdbdbd] text-sm md:text-base text-center md:text-left mt-4 md:mt-0">
          © 2024 RAHULFITZZ. All rights reserved.
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
};

const Logo = () => {
  return (
    <div className="flex items-center justify-center ">
      <div className="md:h-12 md:w-full w-[45%]">
        <img src={(logo as any)?.src || logo} alt="logo" className="w-full h-full" />
      </div>
    </div>
  );
};

const Navigation = () => {
  const links = [
    { href: "/", label: "Home" },
    { href: "/workout-plans", label: "Workout Plan" },
    { href: "/workout-plans#programs", label: "Diet Plan" },
    { href: "/#faq", label: "FAQ's" },
  ];

  return (
    <nav>
      <ul className="flex flex-wrap md:flex-nowrap items-center text-base md:gap-8 gap-6  px-[10%] md:px-0 justify-center md:justify-between">
        {links.map((link) => (
          <li key={link.label}>
            <NavLink href={link.href}>{link.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
