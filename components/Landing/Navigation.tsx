"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navigation() {
  const links = [
    { label: "ABOUT", href: "/about" },
    { label: "LOGIN", href: "/login" },
  ];

  return (
    <nav className="flex justify-between w-full max-w-[500px] mt-6 select-none px-1">
      {links.map((link) => (
        <Link 
          key={link.label} 
          href={link.href} 
          className="group relative inline-block text-xs md:text-sm font-sans font-bold tracking-widest text-[#842A3B] transition-[letter-spacing,color] duration-500 ease-in-out hover:text-[#6B3F69] hover:tracking-[0.4em] pr-[0.4em]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
