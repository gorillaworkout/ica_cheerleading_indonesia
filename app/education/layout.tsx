import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Education - ICA",
  description: "Explore ICA educational programs, coaching certifications, and judge training courses.",
  openGraph: {
    title: "Education - ICA", 
    description: "Explore ICA educational programs, coaching certifications, and judge training courses.",
  },
}

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
