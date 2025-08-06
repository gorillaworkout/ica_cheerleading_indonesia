"use client";

import { ScrollAnimation } from "@/components/ui/scroll-animation-safe";

const logos = [
  { src: "/icu-logo.webp", short: "ICU", link: "https://cheerunion.org" },
  { src: "/acu-logo.webp", short: "ACU", link: "https://cheerunion.org" },
  { src: "/ICA-Logo-Box.webp", short: "ICA", link: "https://indonesiancheer.org" },
];

export default function CheerOrganizationsSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <ScrollAnimation delay={0.1} direction="up">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Official Cheerleading Organizations
          </h2>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {logos.map((logo, index) => (
            <ScrollAnimation key={logo.src} delay={0.2 + (index * 0.1)} direction="up">
              <div 
                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center border shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                onClick={() => window.open(logo.link, '_blank')}
                role="button"
                tabIndex={0}
                aria-label={`Visit ${logo.short} organization website`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.open(logo.link, '_blank');
                  }
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.short + " logo"}
                  className="w-36 h-36 md:w-48 md:h-48 object-contain mb-4"
                />
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
