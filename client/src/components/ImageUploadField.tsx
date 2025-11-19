import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreview(url || null);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange("");
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
          Paste an image URL from the internet (e.g., from Imgur, Google Drive, or any image hosting service)
        </p>
      </div>

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
