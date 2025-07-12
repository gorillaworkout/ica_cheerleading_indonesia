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

// Animation Variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const, // ✅ SOLUSI TYPE
    },
  },
}

export default function CheerOrganizationsSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Official Cheerleading Organizations
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {logos.map((logo) => (
            <motion.div
              key={logo.short}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center border shadow-md hover:shadow-xl transition-all"
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
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
        </motion.div>
      </div>
    </section>
  );
}
