"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar, Award } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const competitions = useSelector((state: RootState) => state.competitions.competitions);
  const profile = useSelector((state: RootState) => state.auth.profile);

  useEffect(() => {
    async function fetchUserCount() {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      if (!error) {
        setUserCount(count);
      }
    }

    fetchUserCount();
  }, []);

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold">Welcome to the Admin Dashboard</h1>
        <p className="text-lg mt-2">Manage your ICA platform with ease and efficiency.</p>
        {profile && (
          <p className="text-xl mt-4 font-semibold">Welcome {profile.display_name || "User"}</p>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your ICA platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount !== null ? userCount : "Loading..."}</div>
            <p className="text-xs text-gray-600">Real-time user count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions.length}</div>
            <p className="text-xs text-gray-600">Competitions from Redux</p>
          </CardContent>
        </Card>

        {/* Placeholder cards for teams and events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Teams</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-gray-600">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-600">Next event in 5 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
