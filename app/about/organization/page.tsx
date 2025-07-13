"use client";

import { structure } from "@/utils/about";
import { Card } from "@/components/ui/card";
import { LayoutGroup, motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { UserCircle } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function OrganizationalPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-red-600 mb-2">
            Organizational Structure
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Meet the team behind the vision, leadership, and excellence of the{" "}
            <span className="font-semibold text-red-600">Indonesia Cheerleading Association (ICA)</span>. 
            These individuals play a vital role in shaping the future of cheerleading in Indonesia.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <p className="text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
            The <strong>Indonesia Cheerleading Association (ICA)</strong> is the official national governing body for
            cheerleading in Indonesia, committed to fostering athleticism, discipline, and sportsmanship.
            Our organizational structure reflects the dedication and professionalism of our leadership team
            in advancing the sport to international standards.
          </p>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {structure.map((person, index) => (
              <motion.div
                key={person.name}
                layoutId={`card-${index}`}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full p-6 bg-white border border-gray-200 hover:border-red-500 shadow-sm hover:shadow-md rounded-xl transition duration-300 flex flex-col justify-center items-center text-center gap-2">
                  <UserCircle className="h-10 w-10 text-red-500 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {person.position}
                  </h3>
                  <p className="text-gray-600 text-sm">{person.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <Footer/>
    </div>
  );
}
