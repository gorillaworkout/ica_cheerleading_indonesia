"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { 
  selectJudges, 
  selectJudgesLoading, 
  fetchAllJudges, 
  deleteJudge, 
  setSelectedJudge 
} from "@/features/judges/judgesSlice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Scale, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { Judge } from "@/types/judges"
import Image from "next/image"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"

interface JudgesTableProps {
  onEdit: (judge: Judge) => void
  onAdd: () => void
}

export function JudgesTable({ onEdit, onAdd }: JudgesTableProps) {
  const dispatch = useAppDispatch()
  const judges = useAppSelector(selectJudges)
  const loading = useAppSelector(selectJudgesLoading)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")

  useEffect(() => {
    dispatch(fetchAllJudges())
  }, [dispatch])

  const handleDelete = async (judge: Judge) => {
    if (window.confirm(`Are you sure you want to delete judge "${judge.name}"?`)) {
      try {
        await dispatch(deleteJudge(judge.id)).unwrap()
      } catch (error) {
        console.error("Error deleting judge:", error)
      }
    }
  }

  const handleRefresh = () => {
    dispatch(fetchAllJudges())
  }

  // Filter judges based on search and filters
  const filteredJudges = judges.filter(judge => {
    const matchesSearch = judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         judge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         judge.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" ? true :
                         filterStatus === "active" ? judge.is_active :
                         !judge.is_active
    
    const matchesLevel = filterLevel === "all" ? true :
                        judge.certification_level === filterLevel

    return matchesSearch && matchesStatus && matchesLevel
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-red-600" />
            <span>Judges Management</span>
            <Badge variant="secondary" className="ml-2">
              {filteredJudges.length} judges
            </Badge>
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={onAdd} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Judge
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search judges by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Levels</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="International">International</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-600 mt-2">Loading judges...</p>
          </div>
        ) : filteredJudges.length === 0 ? (
          <div className="text-center py-8">
            <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Judges Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== "all" || filterLevel !== "all" 
                ? "No judges match your current filters."
                : "Get started by adding your first judge."
              }
            </p>
            {(!searchTerm && filterStatus === "all" && filterLevel === "all") && (
              <Button onClick={onAdd} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Judge
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Competitions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJudges.map((judge) => (
                  <TableRow key={judge.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={judge.image_url ? generateStorageUrl(judge.image_url) : "/placeholder.svg"}
                          alt={judge.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{judge.name}</div>
                        <div className="text-sm text-gray-500">{judge.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{judge.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{judge.specialization}</span>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        judge.certification_level === 'International' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : judge.certification_level === 'Level 4'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : judge.certification_level === 'Level 3'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : judge.certification_level === 'Level 2'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {judge.certification_level === 'International' ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span>INT</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>{judge.certification_level.replace('Level ', 'L')}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{judge.experience}</span>
                    </TableCell>
                                          <TableCell>
                        <div className="text-center">
                          <span className="font-medium text-red-600">{judge.competitions_judged}</span>
                        </div>
                      </TableCell>
                    <TableCell>
                      <Badge variant={judge.is_active ? "default" : "secondary"}>
                        {judge.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {judge.is_featured && (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/about/judges/${judge.id}`, '_blank')}
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(judge)}
                          title="Edit Judge"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(judge)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Judge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 