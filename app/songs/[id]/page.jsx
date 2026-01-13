'use client'

import { useState, useEffect, useRef } from 'react'
import { getSongs, getYouTubeEmbedUrl, incrementDownloads } from '@/lib/supabase'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { Toast } from 'primereact/toast'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SongDetailPage() {
  const params = useParams()
  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [recommendedSongs, setRecommendedSongs] = useState([])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const toast = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (params.id && !initialized.current) {
      initialized.current = true

      async function loadSongData() {
        setLoading(true)
        try {
          const result = await getSongs()
          if (result.success) {
            console.log('All songs:', result.data)
            console.log('Looking for ID:', params.id)
            const foundSong = result.data.find(s => String(s.id) === String(params.id))
            console.log('Found song:', foundSong)
            if (foundSong) {
              setSong(foundSong)
              
              // Get recommended songs
              const recommended = result.data
                .filter(s => String(s.id) !== String(foundSong.id) && s.genre === foundSong.genre)
                .slice(0, 6)
              setRecommendedSongs(recommended)
            }
          }
        } catch (error) {
          console.error('Error loading songs:', error)
        }
        setLoading(false)
      }

      function loadFavorites() {
        const stored = localStorage.getItem('favorites')
        if (stored) {
          setFavorites(JSON.parse(stored))
        }
      }

      loadSongData()
      loadFavorites()
    }
  }, [params.id])

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

  async function handleDownloadPdf(song) {
    if (song.pdf_url) {
      await incrementDownloads(song.id)
      window.open(song.pdf_url, '_blank')
      toast.current?.show({
        severity: 'success',
        summary: 'Downloading',
        detail: `${song.title} PDF is downloading...`,
        life: 3000
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading song details...</p>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Song not found</p>
            <Link href="/songs">
              <Button label="Back to Songs" icon="pi pi-arrow-left" />
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/songs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <i className="pi pi-arrow-left text-xl"></i>
            <span>Back to Songs</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Song Details</h1>
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden text-2xl text-gray-700"
          >
            <i className="pi pi-bars"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Left Side - Song Information */}
          <div className="md:col-span-3">
            <Card className="shadow-lg mb-6">
              <div className="space-y-6">
                {/* Song Image with Click to Zoom */}
                <div className="relative bg-white rounded-lg overflow-hidden cursor-pointer group p-4 flex items-center justify-center" style={{ minHeight: '300px' }} onClick={() => setShowImagePreview(true)}>
                  <img
                    src={song.image_url}
                    alt={song.title}
                    className="max-w-full max-h-80 object-contain group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                    <i className="pi pi-zoom-in text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(song.id)
                    }}
                    className="absolute top-4 right-4 bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                  >
                    <i
                      className={`pi text-2xl ${
                        favorites.includes(song.id)
                          ? 'pi-heart-fill text-red-500'
                          : 'pi-heart text-gray-600'
                      }`}
                    ></i>
                  </button>
                </div>

                {/* Song Info */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{song.title}</h1>
                  <p className="text-2xl text-gray-600 mb-4">{song.artist}</p>

                  <div className="flex flex-wrap gap-4">
                    {song.album && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Album</p>
                        <p className="font-semibold text-gray-800">{song.album}</p>
                      </div>
                    )}
                    {song.genre && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Genre</p>
                        <p className="font-semibold text-gray-800">{song.genre}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">👁️ Views</p>
                    <p className="text-2xl font-bold text-gray-800">{song.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">⬇️ Downloads</p>
                    <p className="text-2xl font-bold text-gray-800">{song.downloads || 0}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {song.youtube_url && (
                    <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button
                        label="Watch on YouTube"
                        icon="pi pi-youtube"
                        className="w-full bg-red-500 hover:bg-red-600"
                      />
                    </a>
                  )}
                  {song.pdf_url && (
                    <Button
                      label="Preview Sheet Music"
                      icon="pi pi-file-pdf"
                      onClick={() => setShowPdfPreview(true)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    />
                  )}
                  {song.pdf_url && (
                    <Button
                      label="Download PDF"
                      icon="pi pi-download"
                      onClick={() => handleDownloadPdf(song)}
                      severity="success"
                      className="flex-1"
                    />
                  )}
                </div>

                {/* Description */}
                {song.description && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{song.description}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* YouTube Player */}
            {song.youtube_url && (
              <Card className="shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="pi pi-youtube text-red-500 mr-2"></i>
                  Music Video
                </h3>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={getYouTubeEmbedUrl(song.youtube_url)}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </Card>
            )}
          </div>

          {/* Right Side - Sidebar (Always on Desktop, Toggle on Mobile) */}
          <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block md:col-span-1`}>
            {/* Recommended Songs */}
            {recommendedSongs.length > 0 && (
              <Card className="shadow-lg sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <i className="pi pi-star-fill text-yellow-400 mr-2"></i>
                  Related Songs
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recommendedSongs.map(recommended => (
                    <Link
                      key={recommended.id}
                      href={`/songs/${recommended.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex gap-3">
                        <img
                          src={recommended.image_url}
                          alt={recommended.title}
                          className="w-12 h-12 rounded object-contain shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate group-hover:text-blue-600">
                            {recommended.title}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{recommended.artist}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Preview Dialog */}
      <Dialog
        visible={showImagePreview}
        onHide={() => setShowImagePreview(false)}
        modal
        maximizable
        header={`${song.title} - Album Art`}
        style={{ width: '95vw', height: '95vh' }}
        className="max-w-full"
      >
        <div className="flex items-center justify-center p-4 h-full bg-gray-100">
          <img
            src={song.image_url}
            alt={song.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </Dialog>

      {/* PDF Preview Dialog with Enhanced Features */}
      <Dialog
        visible={showPdfPreview}
        onHide={() => setShowPdfPreview(false)}
        modal
        maximizable
        header={`Sheet Music - ${song.title}`}
        style={{ width: '95vw', height: '95vh' }}
        className="max-w-full"
      >
        <div className="flex flex-col items-center justify-center p-4 h-full bg-gray-50">
          <div className="w-full h-full flex items-center justify-center bg-white rounded-lg overflow-hidden">
            <iframe
              src={song.pdf_url}
              className="w-full h-full"
              title={`Sheet Music - ${song.title}`}
            ></iframe>
          </div>
        </div>
        <div className="flex gap-2 mt-4 justify-end pt-4 border-t border-gray-200">
          <Button
            label="Download"
            icon="pi pi-download"
            onClick={() => handleDownloadPdf(song)}
            severity="success"
          />
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={() => setShowPdfPreview(false)}
            severity="secondary"
          />
        </div>
      </Dialog>
    </div>
  )
}
