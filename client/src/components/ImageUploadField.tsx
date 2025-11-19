import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageUploadField({ 
  label = "Image",
  value, 
  onChange,
  placeholder = "Enter image URL"
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const objectPathRef = useRef<string | null>(null);

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreview(url || null);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange("");
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    // Store the object path for use in handleUploadComplete
    objectPathRef.current = data.objectPath;
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploading(true);
      try {
        const uploadedObjectPath = objectPathRef.current;
        
        if (!uploadedObjectPath) {
          throw new Error("No object path available");
        }
        
        // Normalize the path to set ACL and get final path
        const response = await apiRequest("POST", "/api/objects/normalize", {
          objectPath: uploadedObjectPath
        });
        
        if (!response.ok) {
          throw new Error("Failed to process uploaded image");
        }
        
        const data = await response.json();
        
        // Use the normalized path
        onChange(data.objectPath);
        setPreview(data.objectPath);
        
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });
      } catch (error) {
        console.error("Error normalizing uploaded image:", error);
        // Clear any stale preview
        setPreview(value || null);
        
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <div className="space-y-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          data-testid="input-image-url"
        />
        <p className="text-xs text-muted-foreground">
          Paste an image URL, or upload from your device:
        </p>
      </div>

      <ObjectUploader
        maxNumberOfFiles={1}
        maxFileSize={10485760}
        onGetUploadParameters={handleGetUploadParameters}
        onComplete={handleUploadComplete}
        buttonClassName="w-full"
      >
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? "Uploading..." : "Upload from Camera or Files"}</span>
        </div>
      </ObjectUploader>

      {preview && (
        <div className="relative rounded-md border overflow-hidden" data-testid="image-preview">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            data-testid="button-remove-image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
