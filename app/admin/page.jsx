'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, uploadFile, createSong, getSongs, updateSong, deleteSong, deleteFile } from '@/lib/supabase'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { FileUpload } from 'primereact/fileupload'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Image } from 'primereact/image'
import { Tag } from 'primereact/tag'

export default function AdminDashboard() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  const toast = useRef(null)
  const imageUploadRef = useRef(null)
  const pdfUploadRef = useRef(null)

  useEffect(() => {
    loadSongs()
  }, [])

  async function loadSongs() {
    setLoading(true)
    const result = await getSongs()
    if (result.success) {
      setSongs(result.data)
    } else {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load songs' })
    }
    setLoading(false)
  }

  function resetForm() {
    setTitle('')
    setArtist('')
    setAlbum('')
    setGenre('')
    setDescription('')
    setYoutubeUrl('')
    setImageFile(null)
    setPdfFile(null)
    setImagePreview(null)
    setCurrentSong(null)
    setEditMode(false)
    if (imageUploadRef.current) imageUploadRef.current.clear()
    if (pdfUploadRef.current) pdfUploadRef.current.clear()
  }

  function openCreateDialog() {
    resetForm()
    setShowDialog(true)
  }

  function openEditDialog(song) {
    setCurrentSong(song)
    setTitle(song.title)
    setArtist(song.artist)
    setAlbum(song.album || '')
    setGenre(song.genre || '')
    setDescription(song.description || '')
    setYoutubeUrl(song.youtube_url || '')
    setImagePreview(song.image_url)
    setEditMode(true)
    setShowDialog(true)
  }

  async function handleSubmit() {
    if (!title || !artist) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Title and Artist are required' })
      return
    }

    if (!editMode && !imageFile) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Image is required' })
      return
    }

    setLoading(true)

    try {
      let imageUrl = imagePreview
      let pdfUrl = currentSong?.pdf_url || null

      // Upload new image if provided
      if (imageFile) {
        const imageResult = await uploadFile(imageFile, 'images')
        if (!imageResult.success) {
          throw new Error('Failed to upload image')
        }
        imageUrl = imageResult.url
      }

      // Upload new PDF if provided
      if (pdfFile) {
        const pdfResult = await uploadFile(pdfFile, 'pdfs')
        if (!pdfResult.success) {
          throw new Error('Failed to upload PDF')
        }
        pdfUrl = pdfResult.url
      }

      const songData = {
        title,
        artist,
        album,
        genre,
        description,
        youtube_url: youtubeUrl,
        image_url: imageUrl,
        pdf_url: pdfUrl
      }

      let result
      if (editMode) {
        result = await updateSong(currentSong.id, songData)
      } else {
        result = await createSong(songData)
      }

      if (result.success) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: editMode ? 'Song updated successfully' : 'Song created successfully' 
        })
        setShowDialog(false)
        resetForm()
        loadSongs()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
      setLoading(false)
    }
  }

  function confirmDelete(song) {
    confirmDialog({
      message: `Are you sure you want to delete "${song.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(song),
      reject: () => {}
    })
  }

  async function handleDelete(song) {
    setLoading(true)
    
    try {
      // Delete files from storage
      if (song.image_url) {
        await deleteFile('images', song.image_url)
      }
      if (song.pdf_url) {
        await deleteFile('pdfs', song.pdf_url)
      }
      
      // Delete from database
      const result = await deleteSong(song.id)
      
      if (result.success) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Song deleted successfully' })
        loadSongs()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
      setLoading(false)
    }
  }

  const imageBodyTemplate = (rowData) => {
    return <Image src={rowData.image_url} alt={rowData.title} width="80" preview />
  }

  const youtubeBodyTemplate = (rowData) => {
    return rowData.youtube_url ? (
      <Tag severity="success" value="Yes" icon="pi pi-check" />
    ) : (
      <Tag severity="danger" value="No" icon="pi pi-times" />
    )
  }

  const pdfBodyTemplate = (rowData) => {
    return rowData.pdf_url ? (
      <Button 
        icon="pi pi-file-pdf" 
        rounded 
        text 
        severity="danger"
        onClick={() => window.open(rowData.pdf_url, '_blank')}
      />
    ) : (
      <Tag severity="secondary" value="None" />
    )
  }

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          rounded 
          text 
          severity="info"
          onClick={() => openEditDialog(rowData)}
        />
        <Button 
          icon="pi pi-trash" 
          rounded 
          text 
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    )
  }

  const onImageSelect = (e) => {
    const file = e.files[0]
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onPdfSelect = (e) => {
    setPdfFile(e.files[0])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your music collection</p>
          </div>
          <div className="flex gap-3">
            <Button 
              label="User View" 
              icon="pi pi-users"
              severity="secondary"
              onClick={() => window.location.href = '/songs'}
            />
            <Button 
              label="Add New Song" 
              icon="pi pi-plus"
              onClick={openCreateDialog}
            />
          </div>
        </div>

        <Card>
          <DataTable 
            value={songs} 
            loading={loading}
            paginator 
            rows={10}
            emptyMessage="No songs found. Add your first song!"
            className="p-datatable-sm"
          >
            <Column field="title" header="Title" sortable />
            <Column field="artist" header="Artist" sortable />
            <Column field="genre" header="Genre" sortable />
            <Column header="Cover" body={imageBodyTemplate} />
            <Column header="YouTube" body={youtubeBodyTemplate} />
            <Column header="PDF" body={pdfBodyTemplate} />
            <Column field="downloads" header="Downloads" sortable />
            <Column field="views" header="Views" sortable />
            <Column header="Actions" body={actionsBodyTemplate} />
          </DataTable>
        </Card>

        <Dialog 
          header={editMode ? "Edit Song" : "Add New Song"}
          visible={showDialog} 
          style={{ width: '50vw' }}
          breakpoints={{ '960px': '75vw', '641px': '95vw' }}
          onHide={() => {
            setShowDialog(false)
            resetForm()
          }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-2 font-semibold">Title *</label>
              <InputText 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Artist *</label>
              <InputText 
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full"
                placeholder="Enter artist name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Album</label>
                <InputText 
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full"
                  placeholder="Enter album name"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Genre</label>
                <InputText 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full"
                  placeholder="Enter genre"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Description</label>
              <InputTextarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
                rows={3}
                placeholder="Enter song description"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">YouTube URL</label>
              <InputText 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Cover Image (PNG/JPG) {!editMode && '*'}</label>
              <FileUpload 
                ref={imageUploadRef}
                mode="basic"
                accept="image/*"
                maxFileSize={5000000}
                onSelect={onImageSelect}
                auto={false}
                chooseLabel={imageFile ? "Change Image" : "Choose Image"}
              />
              {imagePreview && (
                <div className="mt-3">
                  <Image src={imagePreview} alt="Preview" width="200" preview />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-semibold">PDF File (Optional)</label>
              <FileUpload 
                ref={pdfUploadRef}
                mode="basic"
                accept="application/pdf"
                maxFileSize={10000000}
                onSelect={onPdfSelect}
                auto={false}
                chooseLabel={pdfFile ? "Change PDF" : "Choose PDF"}
              />
              {pdfFile && (
                <p className="mt-2 text-sm text-green-600">
                  <i className="pi pi-check-circle mr-2"></i>
                  {pdfFile.name}
                </p>
              )}
              {editMode && currentSong?.pdf_url && !pdfFile && (
                <p className="mt-2 text-sm text-blue-600">
                  <i className="pi pi-file-pdf mr-2"></i>
                  Current PDF attached
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button 
                label="Cancel" 
                severity="secondary"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
              />
              <Button 
                label={editMode ? "Update Song" : "Create Song"}
                icon="pi pi-save"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}