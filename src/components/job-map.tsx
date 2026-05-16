import { useEffect, useState } from "react";
import type { Job } from "@/lib/mock-data";
import { CENTER } from "@/lib/mock-data";

export function JobMap({ jobs, radiusKm }: { jobs: Job[]; radiusKm: number }) {
  const [Comp, setComp] = useState<null | {
    MapContainer: any; TileLayer: any; Marker: any; Popup: any; Circle: any; L: any;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rl, leaflet] = await Promise.all([import("react-leaflet"), import("leaflet")]);
      await import("leaflet/dist/leaflet.css");
      // Fix default icon paths via CDN
      const L = leaflet.default ?? leaflet;
      // @ts-expect-error _getIconUrl is internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      if (!cancelled) setComp({ ...rl, L });
    })();
    return () => { cancelled = true; };
  }, []);

  if (!Comp) {
    return <div className="h-80 w-full animate-pulse rounded-xl bg-muted" />;
  }
  const { MapContainer, TileLayer, Marker, Popup, Circle } = Comp;

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={CENTER} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={CENTER} radius={radiusKm * 1000} pathOptions={{ color: "#6366f1", fillOpacity: 0.08 }} />
        {jobs.filter((j) => j.lat && j.lng).map((j) => (
          <Marker key={j.id} position={[j.lat!, j.lng!]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{j.title}</div>
                <div className="text-muted-foreground">{j.company} · {j.salary}</div>
                <a href={`/jobs/${j.id}`} className="text-primary underline">Xem chi tiết →</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
