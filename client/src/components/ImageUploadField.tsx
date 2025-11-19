import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera, Link2, X } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
}

export default function ImageUploadField({ 
  label = "Image",
  value, 
  onChange,
  onFileSelect,
  placeholder = "Enter image URL"
}: ImageUploadFieldProps) {
  const [uploadMethod, setUploadMethod] = useState<"url" | "file" | "camera">("url");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isCamera = false) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onChange(dataUrl);
        if (onFileSelect) {
          onFileSelect(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreview(url || null);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url" className="gap-2" data-testid="tab-url-upload">
            <Link2 className="w-4 h-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2" data-testid="tab-file-upload">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="camera" className="gap-2" data-testid="tab-camera-upload">
            <Camera className="w-4 h-4" />
            Camera
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            data-testid="input-image-url"
          />
          <p className="text-xs text-muted-foreground">
            Paste an image URL from the internet
          </p>
        </TabsContent>
        
        <TabsContent value="file" className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, false)}
            className="hidden"
            data-testid="input-file-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            data-testid="button-select-file"
          >
            <Upload className="w-4 h-4 mr-2" />
            {selectedFile && uploadMethod === "file" ? selectedFile.name : "Choose from device"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Upload an image from your device files
          </p>
        </TabsContent>
        
        <TabsContent value="camera" className="space-y-2">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e, true)}
            className="hidden"
            data-testid="input-camera-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full"
            data-testid="button-open-camera"
          >
            <Camera className="w-4 h-4 mr-2" />
            {selectedFile && uploadMethod === "camera" ? selectedFile.name : "Take a photo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Take a photo using your camera (mobile only)
          </p>
        </TabsContent>
      </Tabs>

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
