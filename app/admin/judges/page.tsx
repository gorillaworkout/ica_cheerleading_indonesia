"use client"

import { useState } from "react"
import { JudgesTable } from "@/components/admin/judges-table"
import { AddJudgeForm } from "@/components/admin/add-judge-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, ArrowLeft, Users, Award, Trophy } from "lucide-react"
import { Judge } from "@/types/judges"
import Link from "next/link"

export default function AdminJudgesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)

  const handleAddJudge = () => {
    setEditingJudge(null)
    setShowForm(true)
  }

  const handleEditJudge = (judge: Judge) => {
    setEditingJudge(judge)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingJudge(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingJudge(null)
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editingJudge ? "Edit Judge" : "Add New Judge"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {editingJudge ? "Update judge information and credentials" : "Create a new certified judge profile"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <AddJudgeForm 
          judge={editingJudge}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Judges Management</h1>
              <p className="text-gray-600 mt-1">Manage certified judges and their credentials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
            <Scale className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-</div>
            <p className="text-xs text-gray-600">Certified judges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-</div>
            <p className="text-xs text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Judges</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-</div>
            <p className="text-xs text-gray-600">Featured profiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Judges Table */}
      <JudgesTable 
        onEdit={handleEditJudge}
        onAdd={handleAddJudge}
      />
    </div>
  )
} 