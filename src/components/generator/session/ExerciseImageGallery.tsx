import { useState } from "react";

interface ExerciseImageGalleryProps {
  images: string[];
}

export function ExerciseImageGallery({ images }: ExerciseImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={`/exercises/images/${images[0]}`}
        alt=""
        className="mb-5 h-40 w-full rounded-2xl bg-slate-50 object-cover sm:h-48"
      />
    );
  }

  return (
    <div className="sm:flex sm:gap-5">
      <div
        className="relative mb-5 h-40 w-full cursor-pointer overflow-hidden rounded-2xl sm:hidden"
        onClick={() =>
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }
      >
        <img
          src={`/exercises/images/${images[currentIndex]}`}
          alt=""
          className="h-full w-full bg-slate-50 object-cover"
        />
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
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
        <img
          key={image}
          src={`/exercises/images/${image}`}
          alt=""
          className="mb-5 hidden h-55 w-full flex-1 rounded-2xl bg-slate-50 object-cover sm:block"
        />
      ))}
    </div>
  );
}
