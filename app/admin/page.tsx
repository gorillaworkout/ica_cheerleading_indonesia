"use client";

import { formatDate } from "@/utils/dateFormat";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar, Award, MapPin, Target, Activity, TrendingUp, Database, Eye, Plus, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [resultsCount, setResultsCount] = useState<number | null>(null);
  const [recentCompetitions, setRecentCompetitions] = useState<any[]>([]);
  const [topProvinces, setTopProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get data from Redux store
  const competitions = useSelector((state: RootState) => state.competitions.competitions);
  const provinces = useSelector((state: RootState) => state.provinces.provinces);
  const divisions = useSelector((state: RootState) => state.divisions.divisions);
  const profile = useSelector((state: RootState) => state.auth?.profile);
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch user count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact" });

        // Fetch results count
        const { count: resCount } = await supabase
          .from("results")
          .select("id", { count: "exact" });

        // Fetch recent competitions with details (only if Redux is empty)
        let recentComps = [];
        if (competitions.length === 0) {
          const { data } = await supabase
            .from("competitions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);
          recentComps = data || [];
        } else {
          recentComps = competitions.slice(-5).reverse();
        }

        // Calculate top provinces by medals from results table
        const { data: resultsData } = await supabase
          .from("results")
          .select("province, placement");

        const provinceStats = calculateProvinceStats(resultsData || [], provinces);

        setUserCount(usersCount || 0);
        setResultsCount(resCount || 0);
        setRecentCompetitions(recentComps);
        setTopProvinces(provinceStats.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [competitions, provinces]);

  // Function to calculate province medal statistics
  const calculateProvinceStats = (results: any[], provincesData: any[]) => {
    const provinceMap = new Map();
    
    // Create province name mapping
    const provinceMapping = provincesData.reduce((acc, province) => {
      acc[province.id_province] = province.name;
      return acc;
    }, {} as Record<string, string>);

    results.forEach((result) => {
      const provinceName = provinceMapping[result.province] || result.province;
      
      if (!provinceMap.has(provinceName)) {
        provinceMap.set(provinceName, {
          name: provinceName,
          gold_medals: 0,
          silver_medals: 0,
          bronze_medals: 0,
          total_teams: 0
        });
      }

      const provinceData = provinceMap.get(provinceName);
      
      if (result.placement === 1) provinceData.gold_medals += 1;
      else if (result.placement === 2) provinceData.silver_medals += 1;
      else if (result.placement === 3) provinceData.bronze_medals += 1;
    });

    return Array.from(provinceMap.values()).sort((a, b) => {
      if (b.gold_medals !== a.gold_medals) return b.gold_medals - a.gold_medals;
      if (b.silver_medals !== a.silver_medals) return b.silver_medals - a.silver_medals;
      return b.bronze_medals - a.bronze_medals;
    });
  };

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Header */}
      <div className="relative mb-12 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-red-300/20 rounded-full blur-xl animate-bounce"></div>
        
        <div className="relative p-8 lg:p-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                  Admin Command Center
                </h1>
                <p className="text-red-100 text-xl mt-2">
                  Master Control for ICA Cheerleading Platform
                </p>
              </div>
            </div>
            {profile && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Administrator</p>
                    <p className="text-2xl font-bold text-white">
                      Welcome, {profile.display_name || "Admin"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Users Card */}
          <div 
            className="group relative cursor-pointer" 
            onClick={() => handleCardClick('/admin/users')}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">Total Users</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <Users className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {loading ? (
                        <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        userCount?.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-xs text-green-600 font-medium">+12% this month</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competitions Card */}
          <div 
            className="group relative cursor-pointer" 
            onClick={() => handleCardClick('/admin/competitions/add')}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">Competitions</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <Trophy className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {loading ? (
                        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        competitions.length.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-medium">Active events</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Card */}
          <div 
            className="group relative cursor-pointer" 
            onClick={() => handleCardClick('/admin/results/add')}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">Results</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <Award className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {loading ? (
                        <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        resultsCount?.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-xs text-purple-600 font-medium">Total results</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provinces Card */}
          <div 
            className="group relative cursor-pointer" 
            onClick={() => handleCardClick('/admin/province/add')}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">Provinces</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {loading ? (
                        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        provinces.length.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-xs text-green-600 font-medium">Registered regions</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Divisions Card */}
          <div 
            className="group relative cursor-pointer" 
            onClick={() => handleCardClick('/admin/divisions/add')}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">Divisions</CardTitle>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <Target className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {loading ? (
                        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : (
                        divisions.length.toLocaleString() || "0"
                      )}
                    </div>
                    <p className="text-xs text-purple-600 font-medium">Competition categories</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Recent Competitions */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Recent Competitions</CardTitle>
                      <p className="text-sm text-gray-600">Latest championship events</p>
                    </div>
                  </div>
                  <button 
                    className="w-10 h-10 bg-gray-50 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors duration-200"
                    onClick={() => handleCardClick('/admin/competitions/add')}
                  >
                    <Plus className="w-5 h-5 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : recentCompetitions.length > 0 ? (
                    recentCompetitions.map((comp, index) => (
                      <div key={comp.id} className="group/item p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 bg-gray-100 text-gray-600 text-xs font-bold rounded-full flex items-center justify-center border border-gray-200">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900 group-hover/item:text-red-600 transition-colors duration-200">
                                {comp.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{comp.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(comp.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{comp.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              comp.registrationOpen 
                                ? 'bg-green-50 text-green-600 border-green-200' 
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {comp.status}
                            </span>
                            <button className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors duration-200 border border-gray-200">
                              <Eye className="w-4 h-4 text-gray-600 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No competitions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Provinces Leaderboard */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Top Provinces</CardTitle>
                      <p className="text-sm text-gray-600">Leading by medals earned</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-gray-50 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <BarChart3 className="w-5 h-5 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : topProvinces.length > 0 ? (
                    topProvinces.map((province, index) => (
                      <div key={province.id} className="group/item flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          index === 1 ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover/item:text-red-600 transition-colors duration-200">
                            {province.name}
                          </h4>
                          {/* <p className="text-xs text-gray-500">
                            {province.total_teams || 0} teams
                          </p> */}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="flex items-center gap-0.5">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                              <span className="text-gray-600 font-medium">{province.gold_medals || 0}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-gray-600 font-medium">{province.silver_medals || 0}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                              <span className="text-gray-600 font-medium">{province.bronze_medals || 0}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((province.gold_medals || 0) + (province.silver_medals || 0) + (province.bronze_medals || 0))} total
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No provinces data found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
