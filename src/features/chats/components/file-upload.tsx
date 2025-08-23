import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  IconX,
  IconFile,
  IconPhoto,
  IconFileText,
  IconUpload,
  IconLoader2,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  channelId: Id<"channels">
  onUploadComplete?: () => void
  className?: string
}

interface FilePreview {
  file: File
  preview?: string
  uploading: boolean
  progress: number
  error?: string
}

export function FileUpload({ channelId, onUploadComplete, className }: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const generateUploadUrl = useMutation(api.fileUploads.generateUploadUrl)
  const sendMessageWithFile = useMutation(api.fileUploads.sendMessageWithFile)
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate file sizes (max 100MB per file)
    const MAX_SIZE = 100 * 1024 * 1024 // 100MB
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is too large. Max size is 100MB`)
        return false
      }
      return true
    })
    
    // Create preview for images
    const newFiles: FilePreview[] = validFiles.map(file => {
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file)
        : undefined
        
      return {
        file,
        preview,
        uploading: false,
        progress: 0,
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      // Revoke object URL if it's an image
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }
  
  const uploadFile = async (filePreview: FilePreview, index: number) => {
    try {
      // Update progress
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { ...filePreview, uploading: true, progress: 10 }
        return newFiles
      })
      
      // Generate upload URL
      const uploadUrl = await generateUploadUrl()
      
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { ...newFiles[index], progress: 30 }
        return newFiles
      })
      
      // Upload file to storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': filePreview.file.type },
        body: filePreview.file,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { ...newFiles[index], progress: 70 }
        return newFiles
      })
      
      const { storageId } = await response.json()
      
      // Send message with file
      await sendMessageWithFile({
        storageId,
        fileName: filePreview.file.name,
        fileType: filePreview.file.type,
        fileSize: filePreview.file.size,
        channelId,
      })
      
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { ...newFiles[index], progress: 100, uploading: false }
        return newFiles
      })
      
      // Remove from list after successful upload
      setTimeout(() => {
        removeFile(index)
      }, 500)
      
      return true
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { 
          ...newFiles[index], 
          uploading: false, 
          error: 'Upload failed',
          progress: 0
        }
        return newFiles
      })
      toast.error(`Failed to upload ${filePreview.file.name}`)
      return false
    }
  }
  
  const uploadAll = async () => {
    if (files.length === 0) return
    
    setIsUploading(true)
    
    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      if (!files[i].uploading && !files[i].error) {
        await uploadFile(files[i], i)
      }
    }
    
    setIsUploading(false)
    onUploadComplete?.()
  }
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <IconPhoto size={20} />
    if (fileType.includes('pdf') || fileType.includes('document')) return <IconFileText size={20} />
    return <IconFile size={20} />
  }
  
  if (files.length === 0) {
    return (
      <div className={cn('relative', className)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 rounded-md"
        >
          <IconUpload size={20} className="stroke-muted-foreground" />
        </Button>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between p-2 bg-muted rounded-md">
        <span className="text-sm font-medium">
          {files.length} file{files.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Add More
          </Button>
          <Button
            size="sm"
            onClick={uploadAll}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <IconLoader2 size={16} className="mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <IconUpload size={16} className="mr-1" />
                Upload All
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map((filePreview, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-secondary rounded-md"
          >
            {filePreview.preview ? (
              <img
                src={filePreview.preview}
                alt={filePreview.file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                {getFileIcon(filePreview.file.type)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{filePreview.file.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                  disabled={filePreview.uploading}
                >
                  <IconX size={14} />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              {filePreview.uploading && (
                <div className="h-1 mt-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${filePreview.progress}%` }}
                  />
                </div>
              )}
              {filePreview.error && (
                <span className="text-xs text-destructive">{filePreview.error}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*"
      />
    </div>
  )
}