"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import logo from "../assets/img/RF.png";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { getAppEntryHref, getWorkoutPlanHref, getDietPlanHref } from "@/lib/app-entry";
import { cn } from "@/lib/utils";
import JoinNowHighlight from "@/components/join-now-highlight";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileDropDown = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user } = useUserStore();
  const isLoggedIn = !!session || !!user;
  const appHref = getAppEntryHref(isLoggedIn);

  const navLinkClass = (href: string, exact = true) =>
    cn(
      "no-underline transition-colors",
      (exact ? pathname === href : pathname.startsWith(href))
        ? "text-[#eb0000] border border-[#eb0000] px-3 py-1"
        : "hover:text-red-500"
    );

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
      href: "/about",
    },
    {
      name: "Services",
      href: appHref,
    },
    {
      name: "Diet Plan",
      href: appHref,
    },
    {
      name: "Benefits",
      href: "/benefits",
    },
    {
      name: "Blogs",
      href: "/blogs",
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
        <header className="!w-[90%] md:w-full xl:w-full md:!mx-auto xl:!mx-auto mt-8 text-[#96979c] border md:max-w-4xl xl:max-w-[1100px] header items-center relative bg-black md:bg-[#050505] rounded-none">
          <nav className="container flex justify-between gap-2 p-3 md:p-3 xl:p-3 items-center min-w-0">
            <RouterLink
              href="/"
              className="flex items-center gap-2 md:gap-3 h-10 md:h-[60px] min-w-0 shrink no-underline"
            >
              <img
                src={(logo as any)?.src || logo}
                alt="RAHULFITZZ Logo"
                className="h-9 sm:h-full w-auto object-contain shrink-0"
              />
              <span
                className="text-white tracking-wide text-sm sm:text-2xl md:text-[28px] font-bold truncate max-w-[42vw] sm:max-w-none"
                style={{ fontFamily: '"Orbitron", sans-serif' }}
              >
                RahulFitzz
              </span>
            </RouterLink>

            {/* for desktop */}
            <ul className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <li className="cursor-pointer">
                <RouterLink href="/" className={navLinkClass("/")}>
                  Home
                </RouterLink>
              </li>
              <li className="cursor-pointer">
                <RouterLink href="/about" className={navLinkClass("/about")}>
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
                          href={getWorkoutPlanHref(isLoggedIn)}
                          className="no-underline"
                          onClick={() => setIsOpen(false)}
                        >
                          Workout Plan
                        </RouterLink>
                      </li>
                      <li className="hover:text-red-500 cursor-pointer">
                        <RouterLink
                          href={getDietPlanHref(isLoggedIn)}
                          className="no-underline"
                          onClick={() => setIsOpen(false)}
                        >
                          Diet Plan
                        </RouterLink>
                      </li>
                      <li className="hover:text-red-500 cursor-pointer border-t border-white/10 pt-2 mt-1">
                        <RouterLink
                          href={isLoggedIn ? "/book-gym" : "/login"}
                          className="no-underline"
                          onClick={() => setIsOpen(false)}
                        >
                          Gym Booking
                        </RouterLink>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
              <li className="cursor-pointer">
                <RouterLink href="/benefits" className={navLinkClass("/benefits")}>
                  Benefits
                </RouterLink>
              </li>
              <li className="cursor-pointer">
                <RouterLink href="/blogs" className={navLinkClass("/blogs")}>
                  Blogs
                </RouterLink>
              </li>
            </ul>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {!isLoggedIn ? (
                <JoinNowHighlight placement="below" className="hidden md:inline-flex">
                  <RouterLink href={appHref} className="no-underline">
                    <button
                      type="button"
                      className="min-h-10 items-center bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-none font-bold text-sm border border-white/10 touch-manipulation uppercase tracking-widest inline-flex"
                    >
                      Join now
                    </button>
                  </RouterLink>
                </JoinNowHighlight>
              ) : (
                <RouterLink href={appHref}>
                  <button
                    type="button"
                    className="hidden md:inline-flex min-h-10 items-center bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-none font-bold text-sm border border-white/10 touch-manipulation uppercase tracking-widest"
                  >
                    Launch App
                  </button>
                </RouterLink>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden text-white min-h-11 min-w-11 flex items-center justify-center touch-manipulation rounded-none"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <>
                    <div className=" p-3 rounded-none bg-[#18181a]">
                      <img
                        className="h-6 w-6 object-cover"
                        src="https://framerusercontent.com/images/tIEQjQ5QDx1TzUHLSEdkAOUig.svg"
                        alt=""
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className=" p-3 rounded-none bg-[#18181a]">
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
          className="fixed z-50 top-[max(7.5rem,env(safe-area-inset-top)+5.5rem)] right-[max(1rem,env(safe-area-inset-right))] w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-[#141414] text-lightGray rounded-none shadow-lg border border-white/10 overflow-hidden"
        >
          <ul className="flex flex-col p-2 sm:p-3">
            {mNav.map((item, index) => (
              <li
                key={index}
                className="hover:text-red-500 text-[#96979c] cursor-pointer text-base second rounded-none"
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
                href={appHref}
                className="no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex min-h-11 w-full items-center justify-center rounded-none bg-white/10 text-white font-bold text-sm border border-white/10 touch-manipulation">
                  {isLoggedIn ? "Launch App" : "Join now"}
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
