import { onMount, onCleanup, createEffect } from "solid-js";
import L from "leaflet";

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  /** Called with the map instance after mount, so callers can add markers/layers */
  onMapReady?: (map: L.Map) => void;
  class?: string;
}

export function LeafletMap(props: LeafletMapProps) {
  let containerRef!: HTMLDivElement;
  let map: L.Map;

  onMount(() => {
    map = L.map(containerRef).setView(props.center, props.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (props.onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => props.onMapClick!(e.latlng.lat, e.latlng.lng));
    }

    props.onMapReady?.(map);

    onCleanup(() => map.remove());
  });

  createEffect(() => {
    if (map) map.setView(props.center, props.zoom);
  });

  return (
    <div ref={containerRef!} class={props.class ?? "h-64 w-full rounded-xl overflow-hidden"} />
  );
}
