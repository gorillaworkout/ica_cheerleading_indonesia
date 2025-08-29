"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { ProfileHistory } from "@/components/profile/profile-history"

export function AccountHistory() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user?.id) {
    return null
  }

  return <ProfileHistory userId={user.id} />
}
