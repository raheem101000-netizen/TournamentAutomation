import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Maximize2, AlignCenter, Upload, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageUrl: string) => void;
  initialImage?: string;
}

export function ImageEditor({ open, onOpenChange, onSave, initialImage }: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialImage || "");
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"cover" | "contain" | "fill">("cover");
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        setZoom(100);
        setPosition({ x: 50, y: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = (e.clientX - dragStart.current.x) / 2;
    const deltaY = (e.clientY - dragStart.current.y) / 2;

    setPosition((prev) => ({
      x: Math.max(0, Math.min(100, prev.x + deltaX)),
      y: Math.max(0, Math.min(100, prev.y + deltaY)),
    }));

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleSave = () => {
    onSave(imageUrl);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setImageUrl(initialImage || "");
    setZoom(100);
    setPosition({ x: 50, y: 50 });
    setFitMode("cover");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tournament Poster Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageUrl ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image to get started
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload-image"
              >
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
            </div>
          ) : (
            <>
              <div
                className="relative h-64 border rounded-lg overflow-hidden bg-muted cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                data-testid="image-preview-container"
              >
                <img
                  src={imageUrl}
                  alt="Preview"
                  className={cn(
                    "absolute transition-transform",
                    fitMode === "cover" && "w-full h-full object-cover",
                    fitMode === "contain" && "w-full h-full object-contain",
                    fitMode === "fill" && "w-full h-full object-fill"
                  )}
                  style={{
                    transform: `scale(${zoom / 100})`,
                    objectPosition: `${position.x}% ${position.y}%`,
                  }}
                  draggable={false}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-change-image"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Zoom</Label>
                    <span className="text-xs text-muted-foreground">{zoom}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      data-testid="button-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={(value) => setZoom(value[0])}
                      min={50}
                      max={200}
                      step={5}
                      className="flex-1"
                      data-testid="slider-zoom"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      data-testid="button-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fit Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={fitMode === "cover" ? "default" : "outline"}
                      onClick={() => setFitMode("cover")}
                      className="flex-1"
                      data-testid="button-fit-cover"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Cover
                    </Button>
                    <Button
                      size="sm"
                      variant={fitMode === "contain" ? "default" : "outline"}
                      onClick={() => setFitMode("contain")}
                      className="flex-1"
                      data-testid="button-fit-contain"
                    >
                      <AlignCenter className="w-4 h-4 mr-2" />
                      Contain
                    </Button>
                    <Button
                      size="sm"
                      variant={fitMode === "fill" ? "default" : "outline"}
                      onClick={() => setFitMode("fill")}
                      className="flex-1"
                      data-testid="button-fit-fill"
                    >
                      Fill
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fitMode === "cover" && "Image fills entire area, may crop edges"}
                    {fitMode === "contain" && "Entire image visible, may show borders"}
                    {fitMode === "fill" && "Image stretched to fill area"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Position</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 0, y: 0 })}
                      data-testid="button-position-tl"
                    >
                      Top Left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 50, y: 0 })}
                      data-testid="button-position-tc"
                    >
                      Top Center
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 100, y: 0 })}
                      data-testid="button-position-tr"
                    >
                      Top Right
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 0, y: 50 })}
                      data-testid="button-position-ml"
                    >
                      Middle Left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 50, y: 50 })}
                      data-testid="button-position-mc"
                    >
                      Center
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 100, y: 50 })}
                      data-testid="button-position-mr"
                    >
                      Middle Right
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 0, y: 100 })}
                      data-testid="button-position-bl"
                    >
                      Bottom Left
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 50, y: 100 })}
                      data-testid="button-position-bc"
                    >
                      Bottom Center
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPosition({ x: 100, y: 100 })}
                      data-testid="button-position-br"
                    >
                      Bottom Right
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-editor"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageUrl}
            data-testid="button-save-editor"
          >
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
