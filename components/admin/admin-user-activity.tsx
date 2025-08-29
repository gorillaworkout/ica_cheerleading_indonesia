"use client"

import { UserActivityHistory } from "@/components/shared/user-activity-history"

interface AdminUserActivityProps {
  userId: string
  userProfile?: {
    id: string
    email: string
    display_name: string
    role: string
  }
  className?: string
}

export function AdminUserActivity({ userId, userProfile, className = "" }: AdminUserActivityProps) {
  return (
    <UserActivityHistory
      userId={userId}
      isAdmin={true}
      showUserInfo={true}
      userProfile={userProfile}
      className={className}
      variant="admin"
      imageSize="large"
      showFilter={true}
      showPagination={true}
      limit={10}
    />
  )
}
