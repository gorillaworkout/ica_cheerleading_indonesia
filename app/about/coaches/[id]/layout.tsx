import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coach Profile - ICA",
  description: "Learn more about our certified ICA coaches and their expertise in cheerleading training.",
  openGraph: {
    title: "Coach Profile - ICA",
    description: "Learn more about our certified ICA coaches and their expertise in cheerleading training.",
  },
}

export default function CoachDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
