import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";

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
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploading(true);
      try {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        // Normalize the path
        const response = await apiRequest("PUT", "/api/tournament-posters", {
          posterURL: uploadURL
        });
        const data = await response.json();
        
        // Use the normalized path
        onChange(data.objectPath);
        setPreview(data.objectPath);
      } catch (error) {
        console.error("Error normalizing uploaded image:", error);
        // Show error to user - don't update the value on error
        alert("Failed to upload image. Please try again.");
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
