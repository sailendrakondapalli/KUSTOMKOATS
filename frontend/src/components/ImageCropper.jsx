import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, Check, ZoomIn, ZoomOut } from "lucide-react"

// Helper to get cropped image blob from canvas
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92)
  })
}

/**
 * ImageCropper modal
 * Props:
 *   imageSrc   – data URL or object URL of the selected image
 *   aspect     – crop aspect ratio (default 16/5 for hero, 1/1 for logo)
 *   onCrop     – called with the cropped Blob
 *   onCancel   – close without cropping
 *   title      – optional label
 */
export default function ImageCropper({ imageSrc, aspect = 16 / 5, onCrop, onCancel, title = "Crop Image" }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [cropping, setCropping] = useState(false)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleCrop = async () => {
    if (!croppedAreaPixels) return
    setCropping(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCrop(blob)
    } catch (e) {
      console.error("Crop failed", e)
    } finally {
      setCropping(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4">
      <div className="bg-[#2A1408] border border-[#5C3015] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#5C3015]">
          <p className="text-white font-semibold text-sm">{title}</p>
          <button onClick={onCancel} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative w-full" style={{ height: 340, background: "#1A0A02" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: "#0F0501" },
              cropAreaStyle: { border: "2px solid #C8860A" },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-[#5C3015]">
          <ZoomOut size={15} className="text-white/60 flex-shrink-0" />
          <input
            type="range" min={1} max={3} step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#C8860A]"
          />
          <ZoomIn size={15} className="text-white/60 flex-shrink-0" />
          <span className="text-white/60 text-xs w-10 text-right">{zoom.toFixed(1)}x</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-4">
          <button onClick={onCancel}
            className="flex-1 py-2 border border-[#5C3015] text-white/70 rounded-lg text-sm hover:bg-[#3D1F0A] transition-all">
            Cancel
          </button>
          <button onClick={handleCrop} disabled={cropping}
            className="flex-1 py-2 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#C8860A", color: "#1A0A02" }}>
            {cropping
              ? <div className="w-4 h-4 border-2 border-[#1A0A02] border-t-transparent rounded-full animate-spin" />
              : <><Check size={14} /> Apply Crop</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
