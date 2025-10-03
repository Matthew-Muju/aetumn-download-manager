'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Link, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  FileVideo, 
  FileImage, 
  FileAudio,
  Search,
  Trash2,
  FolderOpen,
  X,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MediaItem {
  id: string
  url: string
  type: 'video' | 'image' | 'audio'
  title: string
  size?: string
  source: string
  thumbnail?: string
}

interface DownloadItem extends MediaItem {
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error'
  progress: number
  downloadedSize?: string
  speed?: string
}

export default function AndroidDownloadManager() {
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [foundMedia, setFoundMedia] = useState<MediaItem[]>([])
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeTab, setActiveTab] = useState('scanner')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)
  const { toast } = useToast()

  const handleScan = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to scan for media.",
        variant: "destructive"
      })
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch('/api/scan-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) throw new Error('Scan failed')
      
      const media = await response.json()
      setFoundMedia(media)
      
      toast({
        title: "Scan Complete",
        description: `Found ${media.length} media files on the page.`
      })
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not scan the page. Please check the URL and try again.",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleDeepScan = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to scan for media.",
        variant: "destructive"
      })
      return
    }

    setIsScanning(true)
    try {
      const response = await fetch('/api/deep-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) throw new Error('Deep scan failed')
      
      const media = await response.json()
      setFoundMedia(media)
      
      toast({
        title: "Deep Scan Complete",
        description: `Found ${media.length} media files through deep crawling.`
      })
    } catch (error) {
      toast({
        title: "Deep Scan Failed",
        description: "Could not perform deep scan. Please check the URL and try again.",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleDownload = (media: MediaItem) => {
    const downloadItem: DownloadItem = {
      ...media,
      status: 'pending',
      progress: 0
    }
    
    setDownloads(prev => [...prev, downloadItem])
    
    // Start download simulation
    simulateDownload(downloadItem.id)
    
    toast({
      title: "Download Started",
      description: `Started downloading: ${media.title}`
    })
  }

  const handleBatchDownload = () => {
    const selectedItems = foundMedia.filter(media => selectedMedia.includes(media.id))
    
    if (selectedItems.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select media files to download.",
        variant: "destructive"
      })
      return
    }

    selectedItems.forEach(media => {
      handleDownload(media)
    })

    setSelectedMedia([])
    
    toast({
      title: "Batch Download Started",
      description: `Started downloading ${selectedItems.length} files.`
    })
  }

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    )
  }

  const selectAllMedia = () => {
    if (selectedMedia.length === foundMedia.length) {
      setSelectedMedia([])
    } else {
      setSelectedMedia(foundMedia.map(media => media.id))
    }
  }

  const handlePreview = (media: MediaItem) => {
    setPreviewMedia(media)
  }

  const simulateDownload = (downloadId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setDownloads(prev => prev.map(d => 
          d.id === downloadId 
            ? { ...d, status: 'completed', progress: 100 }
            : d
        ))
      } else {
        setDownloads(prev => prev.map(d => 
          d.id === downloadId 
            ? { ...d, status: 'downloading', progress, speed: `${Math.floor(Math.random() * 5 + 1)} MB/s` }
            : d
        ))
      }
    }, 500)
  }

  const handlePauseResume = (downloadId: string) => {
    setDownloads(prev => prev.map(d => {
      if (d.id === downloadId) {
        if (d.status === 'downloading') {
          return { ...d, status: 'paused' }
        } else if (d.status === 'paused') {
          simulateDownload(downloadId)
          return { ...d, status: 'downloading' }
        }
      }
      return d
    }))
  }

  const handleRemove = (downloadId: string) => {
    setDownloads(prev => prev.filter(d => d.id !== downloadId))
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo className="w-5 h-5" />
      case 'image': return <FileImage className="w-5 h-5" />
      case 'audio': return <FileAudio className="w-5 h-5" />
      default: return <Download className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'downloading': return <Download className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
      case 'error': return <Trash2 className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Aetumn Download Manager</h1>
          </div>
          <p className="text-blue-100">Extract and download media from any webpage</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-lg p-1">
            <TabsTrigger value="scanner" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Media Scanner
            </TabsTrigger>
            <TabsTrigger value="downloads" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Download className="w-4 h-4 mr-2" />
              Downloads ({downloads.length})
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* Media Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Scan Webpage for Media
                </CardTitle>
                <CardDescription>
                  Enter a URL to find all downloadable media files on that page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/video-page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleScan} 
                    disabled={isScanning}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Scan
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleDeepScan} 
                    disabled={isScanning}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Deep...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Deep Scan
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• <strong>Scan:</strong> Quick scan for obvious media files</p>
                  <p>• <strong>Deep Scan:</strong> Thorough crawling through linked pages</p>
                </div>
              </CardContent>
            </Card>

            {/* Found Media */}
            {foundMedia.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Found Media ({foundMedia.length})</CardTitle>
                      <CardDescription>
                        Select media files to download
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={selectAllMedia}
                      >
                        {selectedMedia.length === foundMedia.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleBatchDownload}
                        disabled={selectedMedia.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Selected ({selectedMedia.length})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {foundMedia.map((media) => (
                      <div key={media.id} className={`flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow ${selectedMedia.includes(media.id) ? 'ring-2 ring-blue-500' : ''}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(media.id)}
                            onChange={() => toggleMediaSelection(media.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          {getMediaIcon(media.type)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{media.title}</p>
                            <p className="text-sm text-gray-500">{media.source}</p>
                            {media.size && (
                              <Badge variant="secondary" className="mt-1">
                                {media.size}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(media)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDownload(media)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Active Downloads</CardTitle>
                <CardDescription>
                  Manage your download queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No downloads yet. Scan a webpage to find media.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {downloads.map((download) => (
                      <div key={download.id} className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getMediaIcon(download.type)}
                            <div>
                              <p className="font-medium text-gray-900">{download.title}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {getStatusIcon(download.status)}
                                <span className="capitalize">{download.status}</span>
                                {download.speed && <span>• {download.speed}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(download.status === 'downloading' || download.status === 'paused') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePauseResume(download.id)}
                              >
                                {download.status === 'downloading' ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemove(download.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={download.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{Math.round(download.progress)}% complete</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>
                  Your downloaded media files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloads.filter(d => d.status === 'completed').length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your library will appear here once downloads complete.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {downloads.filter(d => d.status === 'completed').map((download) => (
                      <div key={download.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                          {download.type === 'video' ? (
                            <FileVideo className="w-12 h-12 text-gray-400" />
                          ) : download.type === 'image' ? (
                            <FileImage className="w-12 h-12 text-gray-400" />
                          ) : (
                            <FileAudio className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1 truncate">{download.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{download.source}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {download.type}
                            </Badge>
                            {download.size && (
                              <span className="text-xs text-gray-500">{download.size}</span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Media Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Media Preview</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewMedia(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    {previewMedia.type === 'video' ? (
                      <FileVideo className="w-16 h-16 text-gray-400" />
                    ) : previewMedia.type === 'image' ? (
                      <FileImage className="w-16 h-16 text-gray-400" />
                    ) : (
                      <FileAudio className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{previewMedia.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="secondary">{previewMedia.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span>{previewMedia.source}</span>
                      </div>
                      {previewMedia.size && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span>{previewMedia.size}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <a 
                          href={previewMedia.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        handleDownload(previewMedia)
                        setPreviewMedia(null)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPreviewMedia(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
