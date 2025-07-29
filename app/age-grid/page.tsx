"use client"
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookOpen, Users, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublicImageUrl } from "@/utils/getPublicImageUrl";
import { getDirectPdfUrl, findPdfFile } from "@/utils/getPublicPdfUrl";

// export const metadata: Metadata = {
//   title: "Safety Rules & Age Grid",
//   description: "Official safety rules and age grid guidelines from ICA.",
//   openGraph: {
//     title: "Safety Rules & Age Grid - ICA",
//     description: "Official safety rules and age grid guidelines from ICA.",
//   },
// };

export default function AgeGrid() {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.svg")
  const [pdfUrl, setPdfUrl] = useState<string>("")
  
  useEffect(() => {
    getPublicImageUrl("539-medal.jpeg").then((url) => {
      if (url) setImageUrl(url)
    })
    
    // Try to find PDF file with multiple strategies
    const findPdf = async () => {
      try {
        // First try direct URL
        let pdfUrl = getDirectPdfUrl("670-juklak.pdf")
        
        // Test if the URL is accessible by trying to find the file
        const foundPdf = await findPdfFile("670-juklak")
        if (foundPdf) {
          setPdfUrl(foundPdf)
        } else {
          // If not found, try other possible names
          const alternatives = ["juklak.pdf", "age-grid.pdf", "ica-age-grid.pdf"]
          for (const alt of alternatives) {
            const altPdf = await findPdfFile(alt.replace('.pdf', ''))
            if (altPdf) {
              setPdfUrl(altPdf)
              break
            }
          }
        }
        
        // If still not found, use fallback
        if (!foundPdf) {
          console.warn("PDF not found in Supabase, using fallback")
          setPdfUrl("https://cheerunion.org/wp-content/uploads/2024/05/ICU_AgeGrid_2024.pdf")
        }
      } catch (error) {
        console.error("Error finding PDF:", error)
        // Fallback to external URL
        setPdfUrl("https://cheerunion.org/wp-content/uploads/2024/05/ICU_AgeGrid_2024.pdf")
      }
    }
    
    findPdf()
  }, [])

  const resources = [
    {
      title: "Cheerleading & Performance Cheer Safety Rules",
      items: [
        { name: "2024 Sport of Cheer Rules & Guidelines", href: "https://cheerunion.org/wp-content/uploads/2024/05/ICU_2024_Rules_CH-PC.pdf" },
        { name: "2025 Sport of Cheer Rules & Guidelines", href: "https://cheerunion.org/wp-content/uploads/2024/09/ICU_2025_Rules_CH-PC.pdf" },
      ],
    },
    {
      title: "Cheerleading Discipline Safety Rules",
      items: [
        { name: "Cheerleading Discipline Safety Rules", href: "https://cheerunion.org/wp-content/uploads/2024/05/ICU_2024_Rules_Cheerleading.pdf" },
        { name: "Cheerleading Glossary", href: "https://cheerunion.org/cheerleading-glossary/" },
      ],
    },
    {
      title: "Performance Cheer Discipline Safety Rules",
      items: [
        { name: "Division Rules & Regulations", href: "#" },
        { name: "Performance Cheer Glossary", href: "https://cheerunion.org/education/performancecheerglossary/" },
        { name: "Category Definitions", href: "https://cheerunion.org/wp-content/uploads/2023/10/ICU_PC_2022_category-definitions.pdf" },
      ],
    },
    {
      title: "Special Abilities Safety Rules",
      items: [
        { name: "2024 Special Abilities Division Rules & Regulations", href: "https://cheerunion.org/wp-content/uploads/2024/05/ICU_2024_Rules_Special-Abilities.pdf" },
        { name: "2025 Special Abilities Division Rules & Regulations", href: "https://cheerunion.org/wp-content/uploads/2024/09/ICU_2025_Rules_Special-Abilities.pdf" },
      ],
    },
    {
      title: "Adaptive Abilities (ParaCheer) Safety Rules",
      items: [
        { name: "2024 Adaptive Abilities Division Rules & Regulations", href: "https://cheerunion.org/wp-content/uploads/2024/05/ICU_2024_Rules_Adaptive-Abilities.pdf" },
        { name: "2025 Adaptive Abilities Division Rules & Regulations", href: "https://cheerunion.org/wp-content/uploads/2024/09/ICU_2025_Rules_Adaptive-Abilities.pdf" },
      ],
    },
    {
      title: "Cheerleading Age Grid",
      items: [
        { 
          name: "2024 Age Grid", 
          href: pdfUrl || "https://cheerunion.org/wp-content/uploads/2024/05/ICU_AgeGrid_2024.pdf" 
        },
        { 
          name: "2025 Age Grid", 
          href: pdfUrl || "https://cheerunion.org/wp-content/uploads/2024/05/ICU_AgeGrid_2025.pdf" 
        },
      ],
    },
  ];
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <Image
            src={imageUrl}
            alt="Safety Rules and Age Grid"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Safety Rules & Age Grid</h1>
              <p className="text-xl md:text-2xl mb-8">
                Official ICA Rules, Regulations, and Age Grid Guidelines
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Rules & Regulations</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Users className="h-5 w-5" />
                  <span>Division Guidelines</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Award className="h-5 w-5" />
                  <span>Age Grid Documents</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rules & Age Grid Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Documents</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Access the latest official safety rules, division regulations, and age grid charts for all ICA disciplines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((section) => (
                <div key={section.title} className="bg-white border rounded-lg p-4 shadow">
                  <h2 className="font-semibold text-lg mb-2">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          className="text-red-600 hover:underline"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
