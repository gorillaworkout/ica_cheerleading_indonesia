"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchPublicImages } from "@/features/publicImages/publicImagesSlice";

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
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const logos = [
  { name: "163-icu-logo-new.png", short: "ICU", link: "https://cheerunion.org" },
  { name: "630-acu-logo.jpg", short: "ACU", link: "https://cheerunion.org" },
  { name: "072-ica-logo.png", short: "ICA", link: "https://indonesiancheer.org" },
];

export default function CheerOrganizationsSection() {
  const dispatch = useAppDispatch()

  const { images } = useAppSelector((state) => state.publicImages)
  useEffect(() => {
    if (images.length === 0) {
      dispatch(fetchPublicImages())
    }
  }, [dispatch, images.length])
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Official Cheerleading Organizations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {logos.map((logo) => {
            const matchedImg = images.find((img) => img.name === logo.name)
            return (
              <div 
                key={logo.name} 
                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center border shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                onClick={() => window.open(logo.link, '_blank')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.open(logo.link, '_blank');
                  }
                }}
              >
                {matchedImg && (
                  <img
                    src={matchedImg.url}
                    alt={logo.name}
                    className="w-36 h-36 md:w-48 md:h-48 object-contain mb-4"
                  />
                )}
                <p className="text-sm text-gray-600 font-medium">{logo.short}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
