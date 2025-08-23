import { useState } from 'react'
import {
  IconFile,
  IconPhoto,
  IconFileText,
  IconDownload,
  IconEye,
  IconX,
  IconVideo,
  IconMusic,
  IconFileZip,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FileAttachmentProps {
  fileUrls: string[]
  fileMetadata: Array<{
    name: string
    mimeType: string
    size: number
    createdAt: number
  }>
  className?: string
}

export function FileAttachment({ fileUrls, fileMetadata, className }: FileAttachmentProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  
  if (!fileUrls || fileUrls.length === 0) return null
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <IconPhoto size={20} />
    if (fileType.startsWith('video/')) return <IconVideo size={20} />
    if (fileType.startsWith('audio/')) return <IconMusic size={20} />
    if (fileType.includes('pdf') || fileType.includes('document')) return <IconFileText size={20} />
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <IconFileZip size={20} />
    return <IconFile size={20} />
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const openPreview = (index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }
  
  const isPreviewable = (fileType: string) => {
    return fileType.startsWith('image/') || 
           fileType.startsWith('video/') || 
           fileType.startsWith('audio/') ||
           fileType.includes('pdf')
  }
  
  return (
    <>
      <div className={cn('mt-2 space-y-2 max-w-full overflow-hidden', className)}>
        {fileUrls.map((url, index) => {
          const metadata = fileMetadata[index]
          if (!metadata) return null
          
          const { name: fileName, mimeType: fileType, size: fileSize } = metadata
          const isImage = fileType.startsWith('image/')
          const isVideo = fileType.startsWith('video/')
          
          // For images, show inline preview
          if (isImage) {
            return (
              <div key={index} className='relative group inline-block max-w-[200px]'>
                <img
                  src={url}
                  alt={fileName}
                  className='max-w-[200px] max-h-[150px] w-auto h-auto object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity'
                  onClick={() => openPreview(index)}
                />
                <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <div className='flex gap-1'>
                    <Button
                      size="icon"
                      variant="secondary"
                      className='h-8 w-8 rounded-full'
                      onClick={(e) => {
                        e.stopPropagation()
                        openPreview(index)
                      }}
                    >
                      <IconEye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className='h-8 w-8 rounded-full'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(url, fileName)
                      }}
                    >
                      <IconDownload size={16} />
                    </Button>
                  </div>
                </div>
                <div className='absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity'>
                  {fileName}
                </div>
              </div>
            )
          }
          
          // For videos, show video player
          if (isVideo) {
            return (
              <div key={index} className='relative group max-w-xs'>
                <video
                  src={url}
                  controls
                  className='w-full max-h-60 rounded-lg border'
                  preload='metadata'
                >
                  Your browser does not support the video tag.
                </video>
                <div className='mt-1 text-xs text-muted-foreground flex items-center gap-2'>
                  <IconVideo size={14} />
                  <span className='truncate flex-1'>{fileName}</span>
                  <span>{formatFileSize(fileSize)}</span>
                </div>
              </div>
            )
          }
          
          // For other files, show file card
          return (
            <div 
              key={index}
              className='flex items-center gap-3 p-3 bg-secondary rounded-lg max-w-xs hover:bg-secondary/80 transition-colors'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded bg-muted'>
                {getFileIcon(fileType)}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-sm truncate'>
                  {fileName}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {formatFileSize(fileSize)}
                </div>
              </div>
              <div className='flex gap-1'>
                {isPreviewable(fileType) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className='h-8 w-8'
                    onClick={() => openPreview(index)}
                  >
                    <IconEye size={16} />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className='h-8 w-8'
                  onClick={() => handleDownload(url, fileName)}
                >
                  <IconDownload size={16} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span className='truncate'>
                {fileMetadata[previewIndex]?.name}
              </span>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>
                  {formatFileSize(fileMetadata[previewIndex]?.size || 0)}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(
                    fileUrls[previewIndex], 
                    fileMetadata[previewIndex]?.name || 'file'
                  )}
                >
                  <IconDownload size={16} />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className='flex justify-center items-center min-h-[400px]'>
            {fileMetadata[previewIndex] && (() => {
              const fileType = fileMetadata[previewIndex].mimeType
              const url = fileUrls[previewIndex]
              
              if (fileType.startsWith('image/')) {
                return (
                  <img
                    src={url}
                    alt={fileMetadata[previewIndex].name}
                    className='max-w-full max-h-[70vh] object-contain'
                  />
                )
              }
              
              if (fileType.startsWith('video/')) {
                return (
                  <video
                    src={url}
                    controls
                    className='max-w-full max-h-[70vh]'
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              }
              
              if (fileType.startsWith('audio/')) {
                return (
                  <div className='w-full max-w-md'>
                    <audio
                      src={url}
                      controls
                      className='w-full'
                      autoPlay
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                )
              }
              
              if (fileType.includes('pdf')) {
                return (
                  <iframe
                    src={url}
                    className='w-full h-[70vh] border-0'
                    title={fileMetadata[previewIndex].name}
                  />
                )
              }
              
              return (
                <div className='text-center text-muted-foreground'>
                  <IconFile size={64} className='mx-auto mb-4' />
                  <p>Cannot preview this file type</p>
                  <p className='text-sm'>Click download to view the file</p>
                </div>
              )
            })()}
          </div>
          
          {/* Navigation for multiple files */}
          {fileUrls.length > 1 && (
            <div className='flex items-center justify-center gap-4 mt-4'>
              <Button
                variant="outline"
                size="sm"
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className='text-sm text-muted-foreground'>
                {previewIndex + 1} of {fileUrls.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={previewIndex === fileUrls.length - 1}
                onClick={() => setPreviewIndex(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}