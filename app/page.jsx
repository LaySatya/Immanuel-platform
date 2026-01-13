'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'

export default function LandingPage() {
  const [status, setStatus] = useState('testing')
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ songs: 0, views: 0, downloads: 0 })

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      // Test connection
      const { data, error } = await supabase
        .from('songs')
        .select('*')

      if (error) throw error
      
      // Calculate stats
      const totalViews = data.reduce((sum, song) => sum + (song.views || 0), 0)
      const totalDownloads = data.reduce((sum, song) => sum + (song.downloads || 0), 0)
      
      setStats({
        songs: data.length,
        views: totalViews,
        downloads: totalDownloads
      })
      
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  if (status === 'testing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <ProgressSpinner />
          <p className="mt-4 text-lg">Testing Supabase connection...</p>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center">
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
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-10 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-16">
            <div className="text-white text-2xl font-bold flex items-center">
              <i className="pi pi-heart-fill mr-2"></i>
              Music Platform
            </div>
            <Button 
              label="Admin Login" 
              icon="pi pi-lock"
              outlined
              className="text-white border-white hover:bg-white/10"
              onClick={() => window.location.href = '/admin'}
            />
          </div>

          {/* Hero Content */}
          <div className="text-center text-white py-20">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 drop-shadow-2xl animate-fade-in">
              🎵 Your Music
              <br />
              <span className="text-yellow-300">Your Way</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-purple-100 max-w-3xl mx-auto">
              Discover, stream, and download your favorite songs. 
              Watch music videos and access exclusive content.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                label="Explore Music" 
                icon="pi pi-play-circle"
                size="large"
                className="bg-white text-purple-600 border-0 hover:bg-purple-50 px-8 py-4 text-lg font-semibold shadow-2xl"
                onClick={() => window.location.href = '/songs'}
              />
              <Button 
                label="Watch Videos" 
                icon="pi pi-youtube"
                size="large"
                outlined
                className="text-white border-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/songs'}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-105 transition-all">
                <i className="pi pi-music text-5xl mb-4"></i>
                <div className="text-4xl font-bold mb-2">{stats.songs}+</div>
                <div className="text-lg text-purple-100">Songs Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-105 transition-all">
                <i className="pi pi-eye text-5xl mb-4"></i>
                <div className="text-4xl font-bold mb-2">{stats.views.toLocaleString()}</div>
                <div className="text-lg text-purple-100">Total Views</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-105 transition-all">
                <i className="pi pi-download text-5xl mb-4"></i>
                <div className="text-4xl font-bold mb-2">{stats.downloads.toLocaleString()}</div>
                <div className="text-lg text-purple-100">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">
            Everything You Need
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <i className="pi pi-youtube text-6xl text-red-500 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Music Videos</h3>
              <p className="text-gray-600">
                Watch high-quality music videos embedded directly
              </p>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <i className="pi pi-download text-6xl text-blue-500 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Easy Downloads</h3>
              <p className="text-gray-600">
                Download PDFs, lyrics, and sheet music instantly
              </p>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <i className="pi pi-search text-6xl text-green-500 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Smart Search</h3>
              <p className="text-gray-600">
                Find songs quickly with our powerful search engine
              </p>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <i className="pi pi-heart-fill text-6xl text-pink-500 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Favorites</h3>
              <p className="text-gray-600">
                Save your favorite songs for quick access
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Start Listening?
          </h2>
          <p className="text-2xl text-purple-100 mb-10">
            Join thousands of music lovers exploring our library
          </p>
          <Button 
            label="Get Started Now" 
            icon="pi pi-arrow-right"
            size="large"
            className="bg-white text-purple-600 border-0 hover:bg-purple-50 px-12 py-5 text-xl font-bold shadow-2xl"
            onClick={() => window.location.href = '/songs'}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <i className="pi pi-heart-fill mr-2"></i>
                Music Platform
              </h3>
              <p className="text-gray-400">
                Your ultimate destination for music discovery and streaming.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/songs" className="hover:text-white transition-colors">Browse Music</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Admin Panel</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <i className="pi pi-facebook text-2xl hover:text-blue-400 cursor-pointer transition-colors"></i>
                <i className="pi pi-twitter text-2xl hover:text-blue-300 cursor-pointer transition-colors"></i>
                <i className="pi pi-instagram text-2xl hover:text-pink-400 cursor-pointer transition-colors"></i>
                <i className="pi pi-youtube text-2xl hover:text-red-500 cursor-pointer transition-colors"></i>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 Music Platform. Built with ❤️ using Next.js & Supabase</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this to your globals.css for animations
/*
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.delay-700 {
  animation-delay: 700ms;
}

.delay-1000 {
  animation-delay: 1000ms;
}
*/