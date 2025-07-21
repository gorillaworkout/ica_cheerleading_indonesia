import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coaches - ICA",
  description: "Meet our certified coaches who bring years of experience and expertise to help develop the next generation of cheerleaders.",
  openGraph: {
    title: "Coaches - ICA",
    description: "Meet our certified coaches who bring years of experience and expertise to help develop the next generation of cheerleaders.",
  },
}

export default function CoachesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
