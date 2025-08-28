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
import { LevelIndicator } from "@/utils/levelIndicator"
import { Judge } from "@/types/judges"
import Image from "next/image"
import { generateStorageUrl } from "@/utils/getPublicImageUrl"
import { useToast } from "@/hooks/use-toast"

interface JudgesTableProps {
  onEdit: (judge: Judge) => void
  onAdd: () => void
}

export function JudgesTable({ onEdit, onAdd }: JudgesTableProps) {
  const dispatch = useAppDispatch()
  const judges = useAppSelector(selectJudges)
  const loading = useAppSelector(selectJudgesLoading)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [deleteConfirm, setDeleteConfirm] = useState<Judge | null>(null)

  useEffect(() => {
    dispatch(fetchAllJudges())
  }, [dispatch])

  const handleDelete = (judge: Judge) => {
    setDeleteConfirm(judge)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await dispatch(deleteJudge(deleteConfirm.id)).unwrap()
      toast({
        title: "Berhasil",
        description: `Judge "${deleteConfirm.name}" berhasil dihapus.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting judge:", error)
      toast({
        title: "Gagal",
        description: `Gagal menghapus judge "${deleteConfirm.name}".`,
        variant: "destructive",
      })
    }
    
    setDeleteConfirm(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
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
                        (() => {
                          if (filterLevel === "L1") return judge.certification_level.includes("Level 1")
                          if (filterLevel === "L2") return judge.certification_level.includes("Level 2")
                          if (filterLevel === "L3") return judge.certification_level.includes("Level 3")
                          if (filterLevel === "L4") return judge.certification_level.includes("Level 4")
                          if (filterLevel === "INT") return judge.certification_level.includes("International")
                          return false
                        })()

    return matchesSearch && matchesStatus && matchesLevel
  })

  return (
    <>
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
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="INT">INT</option>
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
                  {/* <TableHead>Level</TableHead> */}
                  <TableHead>Experience</TableHead>
                  <TableHead>Competitions</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Featured</TableHead> */}
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
                    {/* <TableCell>
                      <LevelIndicator 
                        certificationLevel={judge.certification_level}
                        variant="badge"
                        size="sm"
                      />
                    </TableCell> */}
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
                    {/* <TableCell>
                      {judge.is_featured && (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                          Featured
                        </Badge>
                      )}
                    </TableCell> */}
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

    {/* Delete Confirmation Dialog */}
    {deleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus judge <strong>"{deleteConfirm?.name}"</strong>?
          </p>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={cancelDelete}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Hapus Judge
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
} 