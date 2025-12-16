'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react'

export default function SeedDemoPage() {
  const [loading, setLoading] = useState(false)
  const [inspecting, setInspecting] = useState(true)
  const [existingData, setExistingData] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    inspectExistingData()
  }, [])

  const inspectExistingData = async () => {
    setInspecting(true)
    try {
      const response = await fetch('/api/inspect-data')
      if (response.ok) {
        const data = await response.json()
        setExistingData(data.summary)
      }
    } catch (err) {
      console.error('Failed to inspect data:', err)
    } finally {
      setInspecting(false)
    }
  }

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed-demo', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to seed demo data')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-teal-600" />
            <div>
              <CardTitle className="text-2xl">Database Overview & Demo Data</CardTitle>
              <CardDescription className="mt-2">
                View existing data and populate with additional demo content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Data Summary */}
          {inspecting ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Checking existing data...</span>
              </div>
            </div>
          ) : existingData && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Current Database Status</h3>
                <Button variant="ghost" size="sm" onClick={inspectExistingData}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">{existingData.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customers:</span>
                  <span className="font-medium">{existingData.customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects:</span>
                  <span className="font-medium">{existingData.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium">{existingData.categories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks:</span>
                  <span className="font-medium">{existingData.tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-medium">{existingData.comments}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Add demo data:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 3 additional customers</li>
              <li>• 6 sample projects with various statuses</li>
              <li>• 5+ tasks across projects</li>
              <li>• Sample comments and discussions</li>
            </ul>
          </div>

          {!result && !error && (
            <Button
              onClick={handleSeed}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Seeding Demo Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" />
                  Seed Demo Data
                </>
              )}
            </Button>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <h3 className="font-medium text-green-900 mb-2">
                    Demo data seeded successfully!
                  </h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ {result.customers} customers created</li>
                    <li>✓ {result.projects} projects created</li>
                    <li>✓ {result.tasks} tasks created</li>
                    <li>✓ {result.comments} comments created</li>
                  </ul>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => window.location.href = '/projects'}
                      variant="outline"
                    >
                      View Projects
                    </Button>
                    <Button
                      onClick={() => {
                        inspectExistingData()
                        setResult(null)
                      }}
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Stats
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-2">Error seeding data</h3>
                  <p className="text-sm text-red-800">{error}</p>
                  {error.includes('SUPABASE_SERVICE_ROLE_KEY') && (
                    <div className="mt-3 text-sm text-red-800">
                      <p className="font-medium">To fix this:</p>
                      <ol className="list-decimal ml-4 mt-1 space-y-1">
                        <li>Go to your Supabase dashboard</li>
                        <li>Navigate to Project Settings → API</li>
                        <li>Copy the service_role key</li>
                        <li>Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY</li>
                        <li>Restart the dev server</li>
                      </ol>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        setError(null)
                        setResult(null)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This will create new records in your database.
              You can run this multiple times, but it will create duplicate data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
