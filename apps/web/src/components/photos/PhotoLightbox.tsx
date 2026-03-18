import { createSignal, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import type { PhotoWithSpecies } from "~/lib/queries";

interface PhotoLightboxProps {
  photos: PhotoWithSpecies[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox(props: PhotoLightboxProps) {
  const [index, setIndex] = createSignal(props.initialIndex);
  const [scale, setScale] = createSignal(1);

  let baseScale = 1;
  let initialDistance = 0;
  let lastTapTime = 0;

  const currentPhoto = () => props.photos[index()];

  const prev = () => {
    setIndex((i) => (i > 0 ? i - 1 : props.photos.length - 1));
    setScale(1);
    baseScale = 1;
  };

  const next = () => {
    setIndex((i) => (i < props.photos.length - 1 ? i + 1 : 0));
    setScale(1);
    baseScale = 1;
  };

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        // double tap — reset zoom
        setScale(1);
        baseScale = 1;
      }
      lastTapTime = now;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const newScale = Math.min(5, Math.max(0.5, baseScale * (currentDistance / initialDistance)));
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      baseScale = scale();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <Portal>
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        onClick={props.onClose}
      >
        {/* Close button */}
        <button
          class="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          onClick={(e) => {
            e.stopPropagation();
            props.onClose();
          }}
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <img
          src={currentPhoto().blobUrl}
          alt={currentPhoto().speciesName}
          class="max-h-full max-w-full select-none object-contain"
          style={{ transform: `scale(${scale()})`, "transform-origin": "center center" }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />

        {/* Prev button */}
        {props.photos.length > 1 && (
          <button
            class="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="前の写真"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Next button */}
        {props.photos.length > 1 && (
          <button
            class="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="次の写真"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Photo counter */}
        {props.photos.length > 1 && (
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {index() + 1} / {props.photos.length}
          </div>
        )}
      </div>
    </Portal>
  );
}
