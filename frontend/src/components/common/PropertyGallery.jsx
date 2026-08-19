import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function PropertyGallery({ title, images = [] }) {
  const photos = images.filter(Boolean)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (!photos.length) return null

  const hero = photos[0]
  const side = photos.slice(1, 5)
  const open = (index) => setLightboxIndex(index)
  const close = () => setLightboxIndex(null)
  const prev = () => setLightboxIndex((i) => (i + photos.length - 1) % photos.length)
  const next = () => setLightboxIndex((i) => (i + 1) % photos.length)

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-xl">
        <div className={`grid gap-2 ${side.length ? 'grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 sm:h-80' : ''}`}>
          <button
            type="button"
            onClick={() => open(0)}
            className={`relative overflow-hidden ${side.length ? 'sm:row-span-2' : ''}`}
          >
            <img src={hero} alt={title} className="h-80 w-full object-cover sm:h-full" />
          </button>
          {side.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => open(i + 1)}
              className={`relative hidden overflow-hidden sm:block ${i >= 2 ? 'sm:hidden lg:block' : ''}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === side.length - 1 && photos.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                  Show all photos
                </span>
              )}
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => open(0)}
            className="mt-2 text-sm font-semibold text-forest hover:underline sm:hidden"
          >
            View {photos.length} photos
          </button>
        )}
      </div>

      {lightboxIndex != null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-4 rounded-full bg-white/90 p-2 text-gray-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 md:right-16"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <img
            src={photos[lightboxIndex]}
            alt={`${title} ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <p className="absolute bottom-4 text-sm text-white">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  )
}
