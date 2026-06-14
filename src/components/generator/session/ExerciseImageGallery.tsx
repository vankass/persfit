import { useState } from "react";

interface ExerciseImageGalleryProps {
  images: string[];
}

export function ExerciseImageGallery({ images }: ExerciseImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mb-5 flex h-40 w-full items-center justify-center rounded-2xl bg-slate-50 p-2 sm:h-64">
        <img
          src={`/exercises/images/${images[0]}`}
          alt=""
          className="h-full w-auto rounded-xl object-contain"
        />
      </div>
    );
  }

  return (
    <div className="sm:grid sm:grid-cols-2 sm:gap-5">
      {/* Мобильный слайдер */}
      <div
        className="relative mb-5 h-48 w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-50 sm:hidden"
        onClick={() =>
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }
      >
        <div className="flex h-full w-full items-center justify-center p-2">
          <img
            src={`/exercises/images/${images[currentIndex]}`}
            alt=""
            className="h-full w-auto object-contain"
          />
        </div>
        
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 p-1.5">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-colors ${
                idx === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {images.map((image) => (
        <div key={image} className="mb-5 hidden h-64 w-full items-center justify-center rounded-2xl bg-slate-100 p-3 sm:flex">
          <img
            src={`/exercises/images/${image}`}
            alt=""
            className="h-full w-auto rounded-xl object-contain shadow-sm"
          />
        </div>
      ))}
    </div>
  );
}