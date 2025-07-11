"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  {
    name: "International Cheer Union",
    short: "ICU",
    img: "/logo/icu-logo.avif",
  },
  {
    name: "Asian Cheer Union",
    short: "ACU",
    img: "/logo/acu-logo.jpg",
  },
  {
    name: "Indonesian Cheer Association",
    short: "ICA",
    img: "/logo/ica-logo.png",
  },
];

export default function CheerOrganizationsSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Official Cheerleading Organizations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.short}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center border shadow-lg hover:shadow-2xl transition-all"
               initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                whileHover={{ scale: 1.08 }}
            >
              <div className="relative w-36 h-36 md:w-48 md:h-48 mb-4">
                <Image
                  src={logo.img}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="(min-width: 768px) 12rem, 9rem"
                />
              </div>
              <h3 className="text-xl font-semibold text-center">{logo.short}</h3>
              <p className="text-center text-gray-600">{logo.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
