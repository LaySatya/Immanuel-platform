'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Card } from 'primereact/card'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Button } from 'primereact/button'

export default function Home() {
  const [status, setStatus] = useState('testing')
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('count')
        .limit(1)

      if (error) throw error
      
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Music Platform</h1>
          
          {status === 'testing' && (
            <div>
              <ProgressSpinner />
              <p className="mt-4">Testing Supabase connection...</p>
            </div>
          )}
          
          {status === 'connected' && (
            <div>
              <i className="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
              <h2 className="text-2xl font-semibold text-green-600 mb-4">
                ✅ Connected Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your Next.js app is connected to Supabase.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  label="Admin Dashboard" 
                  icon="pi pi-cog"
                  onClick={() => window.location.href = '/admin'}
                />
                <Button 
                  label="User View" 
                  icon="pi pi-users"
                  severity="secondary"
                  onClick={() => window.location.href = '/songs'}
                />
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <i className="pi pi-times-circle text-6xl text-red-500 mb-4"></i>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">
                Connection Failed
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                Make sure your .env.local file has the correct Supabase credentials.
              </p>
              <Button 
                label="Retry" 
                icon="pi pi-refresh"
                onClick={() => {
                  setStatus('testing')
                  testConnection()
                }}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}