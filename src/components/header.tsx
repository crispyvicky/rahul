"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import logo from "../assets/img/RF.png";
import { Link } from "react-scroll";
import RouterLink from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileDropDown = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const mNav = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "About",
      href: "/#about",
    },
    {
      name: "Services",
      href: "/workout-plans",
    },
    {
      name: "Diet Plan",
      href: "/coming-soon",
    },
    {
      name: "Benefits",
      href: "/#benefits",
    },
    {
      name: "Blogs",
      href: "/#blogs",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
      if (
        mobileDropDown.current?.contains &&
        !mobileDropDown.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="fixed flex top-0 left-0 right-0 w-full items-center xl:items-center justify-center xl:justify-center md:w-[90%] xl:w-[90%] z-50 border-gray h-auto mx-auto">
        <header className="!w-[90%] md:w-full xl:w-full md:!mx-auto xl:!mx-auto mt-8 text-[#96979c] border  md:rounded-[5rem] md:max-w-4xl xl:max-w-[1100px] header items-center relative bg-black md:bg-transparent">
          <nav className="container flex justify-between p-3 md:p-3 xl:p-3 items-center">
            <div className="flex items-center space-x-3 h-12 md:h-[60px] w-auto">
              <img src={(logo as any)?.src || logo} alt="RAHULFITZZ Logo" className="h-full w-auto object-contain" />
              <span className="text-white tracking-wide text-2xl md:text-[28px] font-bold" style={{ fontFamily: '"Orbitron", sans-serif' }}>RahulFitzz</span>
            </div>

            {/* for desktop */}
            <ul className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <li className="hover:text-red-500 cursor-pointer">
                <RouterLink href="/" className="no-underline">
                  Home
                </RouterLink>
              </li>
              <li className="hover:text-red-500 cursor-pointer">
                <RouterLink href="/#about" className="no-underline">
                  About
                </RouterLink>
              </li>
              <li className="relative" ref={dropdownRef}>
                <span
                  onClick={toggleDropdown}
                  className="hover:text-red-500 cursor-pointer flex items-center"
                >
                  Our Services
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </span>
                {isOpen && (
                  <div className="absolute left-0 min-w-[200px] bg-[#141414] text-lightGray rounded-md mt-2 shadow-lg">
                    <ul className="flex flex-col space-y-2 p-4">
                      <li className="hover:text-red-500 cursor-pointer">
                        <RouterLink
                          href="/workout-plans"
                          className="no-underline"
                        >
                          {" "}
                          Workout Plan
                        </RouterLink>
                      </li>
                      <li className="hover:text-red-500 cursor-pointer">
                        <RouterLink
                          href="/coming-soon"
                          className="no-underline"
                        >
                          {" "}
                          Diet Plan
                        </RouterLink>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
              <li className="hover:text-red-500 cursor-pointer">
                <RouterLink href="/#benefits" className="no-underline">
                  Benefits
                </RouterLink>
              </li>
              <li className="hover:text-red-500 cursor-pointer">
                <RouterLink href="/#blogs" className="no-underline">
                  Blogs
                </RouterLink>
              </li>
            </ul>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <RouterLink href="/dashboard">
                <button
                  type="button"
                  className="hidden md:inline-flex min-h-10 items-center bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-full font-bold text-sm border border-white/10 touch-manipulation"
                >
                  Launch App
                </button>
              </RouterLink>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden text-white min-h-11 min-w-11 flex items-center justify-center touch-manipulation rounded-full"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <>
                    <div className=" p-3 rounded-full bg-[#18181a]">
                      <img
                        className="h-6 w-6 object-cover"
                        src="https://framerusercontent.com/images/tIEQjQ5QDx1TzUHLSEdkAOUig.svg"
                        alt=""
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className=" p-3 rounded-full bg-[#18181a]">
                      <img
                        className="h-6 w-6 object-cover"
                        src="https://framerusercontent.com/images/tIEQjQ5QDx1TzUHLSEdkAOUig.svg"
                        alt=""
                      />
                    </div>
                  </>
                )}
              </button>
            </div>
          </nav>
        </header>
      </div>

      {/* //for mbile    */}
      {isMobileMenuOpen && (
        <div
          ref={mobileDropDown}
          className="fixed z-50 top-[max(7.5rem,env(safe-area-inset-top)+5.5rem)] right-[max(1rem,env(safe-area-inset-right))] w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-[#141414] text-lightGray rounded-xl shadow-lg border border-white/10 overflow-hidden"
        >
          <ul className="flex flex-col p-2 sm:p-3">
            {mNav.map((item, index) => (
              <li
                key={index}
                className="hover:text-red-500 text-[#96979c] cursor-pointer text-base second rounded-lg"
              >
                <RouterLink
                  href={item.href}
                  className="no-underline block min-h-11 px-3 py-2.5 flex items-center touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </RouterLink>
              </li>
            ))}
            <li className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-2 px-1 pb-1">
              <RouterLink
                href="/dashboard"
                className="no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white/10 text-white font-bold text-sm border border-white/10 touch-manipulation">
                  Launch App
                </span>
              </RouterLink>
              <RouterLink
                href="/login"
                className="no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex min-h-11 w-full items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm touch-manipulation">
                  Join now
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
