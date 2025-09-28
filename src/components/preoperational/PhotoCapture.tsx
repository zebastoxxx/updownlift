import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  file: File;
  preview: string;
}

interface PhotoCaptureProps {
  photos: Photo[];
  onPhotoAdd: (photo: Photo) => void;
  onPhotoRemove: (index: number) => void;
}

export function PhotoCapture({ photos, onPhotoAdd, onPhotoRemove }: PhotoCaptureProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxSizeMB: number = 3): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px)
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo no válido",
          description: `${file.name} no es una imagen válida`,
          variant: "destructive"
        });
        return false;
      }
      
      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: `${file.name} no debe exceder 20MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      for (const file of validFiles) {
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Create preview
        const preview = URL.createObjectURL(compressedFile);
        
        const photo: Photo = {
          file: compressedFile,
          preview
        };
        
        onPhotoAdd(photo);
      }
      
      toast({
        title: "Fotos agregadas",
        description: `${validFiles.length} foto${validFiles.length !== 1 ? 's' : ''} agregada${validFiles.length !== 1 ? 's' : ''} correctamente`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "No se pudieron procesar algunas imágenes",
        variant: "destructive"
      });
    }
  };

  const handleCameraCapture = () => {
    // Check if we're on a mobile device or if camera is supported
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Try to access camera first to show better error messages
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          // Stop the stream immediately, we just wanted to check permission
          stream.getTracks().forEach(track => track.stop());
          // Now trigger the file input
          cameraInputRef.current?.click();
        })
        .catch((error) => {
          console.error('Camera access error:', error);
          toast({
            title: "Error de cámara",
            description: "No se puede acceder a la cámara. Verificar permisos o usar 'Subir Archivos'.",
            variant: "destructive"
          });
        });
    } else {
      // Fallback for older browsers or unsupported devices
      cameraInputRef.current?.click();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(photos[index].preview);
    onPhotoRemove(index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotos y Evidencias
          {photos.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {photos.length} foto{photos.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capture Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCameraCapture}
            className="h-12"
          >
            <Camera className="h-5 w-5 mr-2" />
            Tomar Foto
          </Button>
          <Button
            variant="outline"
            onClick={handleFileUpload}
            className="h-12"
          >
            <Upload className="h-5 w-5 mr-2" />
            Subir Archivos
          </Button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Fotos Capturadas</div>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={photo.preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💡 Las fotos se comprimen automáticamente para optimizar el almacenamiento y velocidad de sincronización.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}