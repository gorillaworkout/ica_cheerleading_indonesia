"use client"

import { UserActivityHistory } from "@/components/shared/user-activity-history"

interface ProfileHistoryProps {
  userId: string
  className?: string
}

export function ProfileHistory({ userId, className = "" }: ProfileHistoryProps) {
  return (
    <UserActivityHistory
      userId={userId}
      isAdmin={false}
      showUserInfo={false}
      className={className}
      variant="profile"
      imageSize="small"
      showFilter={false}
      showPagination={true}
      limit={5}
    />
  )
}
