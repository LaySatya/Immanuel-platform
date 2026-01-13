'use client'

import { useState, useEffect, useRef } from 'react'
import { getSongs } from '@/lib/supabase'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import Link from 'next/link'

export default function SongsPage() {
  const [songs, setSongs] = useState([])
  const [filteredSongs, setFilteredSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [favorites, setFavorites] = useState([])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const toast = useRef(null)
  const initialized = useRef(false)

  async function loadSongs() {
    setLoading(true)
    const result = await getSongs()
    if (result.success) {
      setSongs(result.data)
      setFilteredSongs(result.data)
    }
    setLoading(false)
  }

  function loadFavorites() {
    const stored = localStorage.getItem('favorites')
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }

  function toggleFavorite(songId) {
    let newFavorites
    if (favorites.includes(songId)) {
      newFavorites = favorites.filter(id => id !== songId)
    } else {
      newFavorites = [...favorites, songId]
    }
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  function filterSongs() {
    let filtered = songs

    if (searchTerm) {
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedGenre) {
      filtered = filtered.filter(song => song.genre === selectedGenre)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'popular':
          return (b.views || 0) - (a.views || 0)
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'artist':
          return a.artist.localeCompare(b.artist)
        default:
          return 0
      }
    })

    setFilteredSongs(filtered)
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      loadSongs()
      loadFavorites()
    }
  }, [])

  useEffect(() => {
    filterSongs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGenre, songs, sortBy])

  const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))]
  const genreOptions = genres.map(g => ({ label: g, value: g }))

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Downloaded', value: 'downloads' },
    { label: 'Title (A-Z)', value: 'title' },
    { label: 'Artist (A-Z)', value: 'artist' }
  ]

  const favoriteSongs = songs.filter(song => favorites.includes(song.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar - Always visible on large screens */}
        <div className={`${
          showMobileSidebar ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl overflow-y-auto flex flex-col fixed md:relative md:h-screen z-40`}>
          
          {/* Close button for mobile */}
          <div className="md:hidden p-4 flex justify-between items-center border-b border-blue-700">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={() => setShowMobileSidebar(false)} className="text-2xl">
              <i className="pi pi-times"></i>
            </button>
          </div>

          {/* Logo/Brand */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Immanuel</h1>
                <p className="text-xs text-blue-200">Music</p>
              </div>
            </div>
          </div>

          {/* Navigation Stats */}
          <nav className="flex-1 px-4 py-6 space-y-4">
            <div className="bg-blue-700/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-1">Total Songs</p>
              <p className="text-3xl font-bold">{songs.length}</p>
            </div>
            <div className="bg-blue-700/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-1">Genres</p>
              <p className="text-3xl font-bold">{genres.length}</p>
            </div>
            <div className="bg-blue-700/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-1">Favorites</p>
              <p className="text-3xl font-bold">{favoriteSongs.length}</p>
            </div>
          </nav>

          {/* Favorites List */}
          <div className="px-4 py-4 border-t border-blue-700 max-h-64 overflow-y-auto">
            <p className="text-xs font-semibold text-blue-200 uppercase mb-3">❤️ Your Favorites</p>
            <div className="space-y-2">
              {favoriteSongs.length === 0 ? (
                <p className="text-xs text-blue-300 text-center py-4">No favorites yet</p>
              ) : (
                favoriteSongs.slice(0, 5).map(song => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    onClick={() => setShowMobileSidebar(false)}
                    className="block px-3 py-2 text-left rounded-lg bg-blue-700/30 hover:bg-blue-600/50 transition-colors group"
                  >
                    <p className="text-xs font-semibold truncate group-hover:text-pink-300">{song.title}</p>
                    <p className="text-xs text-blue-200 truncate">{song.artist}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-blue-700 text-center">
            <p className="text-xs text-blue-300">© 2025 Immanuel Music</p>
            <Link href="/" className="text-xs text-blue-200 hover:text-pink-300 mt-2 block">
              Home
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="md:hidden text-2xl text-gray-700"
              >
                <i className="pi pi-bars"></i>
              </button>
              
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search songs..."
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>
                <Dropdown
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.value)}
                  options={genreOptions}
                  placeholder="Genre"
                  showClear
                  className="w-32 text-sm"
                />
                <Dropdown
                  value={sortBy}
                  onChange={(e) => setSortBy(e.value)}
                  options={sortOptions}
                  className="w-32 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Songs Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading songs...</p>
                </div>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <i className="pi pi-inbox text-6xl mb-4"></i>
                  <p className="text-lg">No songs found</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSongs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/songs/${song.id}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg mb-4 bg-white flex items-center justify-center" style={{ height: '160px' }}>
                        <img
                          src={song.image_url}
                          alt={song.title}
                          className="w-32 h-32 object-contain"
                        />
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(song.id)
                          }}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-md"
                        >
                          <i
                            className={`pi ${
                              favorites.includes(song.id)
                                ? 'pi-heart-fill text-red-500'
                                : 'pi-heart text-gray-600'
                            } text-xl`}
                          ></i>
                        </button>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600">{song.title}</h3>
                        <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span><i className="pi pi-eye mr-1"></i>{song.views || 0}</span>
                          <span><i className="pi pi-download mr-1"></i>{song.downloads || 0}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
