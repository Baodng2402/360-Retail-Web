import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface StoreLocationPickerProps {
  address: string;
  onAddressChange: (value: string) => void;
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  canEdit?: boolean;
  heightClass?: string;
}

const DEFAULT_CENTER: LatLngExpression = [21.0278, 105.8342]; // Hà Nội
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CARTO_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions">CARTO</a> contributors';

export function StoreLocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  canEdit = true,
  heightClass = "h-56",
}: StoreLocationPickerProps) {
  const [mapMounted, setMapMounted] = useState(false);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<
    { displayName: string; lat: string; lon: string }[]
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSearchEnabled, setAddressSearchEnabled] = useState(false);
  // Carto thường ổn định hơn trong môi trường bị chặn OSM
  const [tileUrl, setTileUrl] = useState(CARTO_TILE_URL);
  const [tileAttribution, setTileAttribution] = useState(CARTO_ATTRIBUTION);

  const parsedLat = Number(latitude.trim());
  const parsedLon = Number(longitude.trim());
  const hasValidCoords =
    !Number.isNaN(parsedLat) && !Number.isNaN(parsedLon);

  const currentPosition: LatLngExpression = hasValidCoords
    ? [parsedLat, parsedLon]
    : DEFAULT_CENTER;

  const storeMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html:
          '<div style="width:18px;height:18px;border-radius:9999px;background:#0ea5e9;border:3px solid white;box-shadow:0 0 0 2px rgba(15,23,42,0.35)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      }),
    [],
  );

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (!canEdit) return;
        const { lat, lng } = e.latlng;
        onLatitudeChange(String(lat));
        onLongitudeChange(String(lng));
      },
    });
    return hasValidCoords ? (
      <Marker position={currentPosition} icon={storeMarkerIcon} />
    ) : null;
  };

  const MapAutoResize = () => {
    const map = useMap();
    useEffect(() => {
      // Trên modal, Leaflet cần invalidateSize sau khi content đã animate xong
      map.whenReady(() => {
        map.invalidateSize();
        const id = window.setTimeout(() => {
          map.invalidateSize();
        }, 200);
        return () => window.clearTimeout(id);
      });
    }, [map]);
    return null;
  };

  useEffect(() => {
    // Trong Dialog (modal) thường mount khi container chưa có size thật.
    // Delay 1 nhịp để Leaflet tính layout rồi mới render map.
    const id = window.setTimeout(() => setMapMounted(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!addressSearchEnabled) {
      setAddressSuggestions([]);
      setAddressLoading(false);
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setAddressLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=vn&q=${encodeURIComponent(
          address.trim(),
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          display_name: string;
          lat: string;
          lon: string;
        }[];
        setAddressSuggestions(
          data.map((item) => ({
            displayName: item.display_name,
            lat: item.lat,
            lon: item.lon,
          })),
        );
      } catch {
        // ignore
      } finally {
        setAddressLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [address, addressSearchEnabled]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="store-address">Address / Địa chỉ</Label>
        <Input
          id="store-address"
          placeholder="Nhập địa chỉ cửa hàng..."
          ref={addressInputRef}
          value={address}
          onChange={(e) => {
            setAddressSearchEnabled(true);
            onAddressChange(e.target.value);
          }}
          disabled={!canEdit}
        />
        {addressLoading && (
          <p className="mt-1 text-xs text-muted-foreground">
            Đang gợi ý địa chỉ...
          </p>
        )}
        {addressSuggestions.length > 0 && (
          <div className="mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover text-popover-foreground text-sm shadow-md">
            {addressSuggestions.map((s) => (
              <button
                key={`${s.lat}-${s.lon}-${s.displayName}`}
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  onAddressChange(s.displayName);
                  onLatitudeChange(s.lat);
                  onLongitudeChange(s.lon);
                  setAddressSuggestions([]);
                  setAddressSearchEnabled(false);
                  addressInputRef.current?.blur();
                }}
              >
                {s.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>GPS Location (map preview)</Label>
        <p className="text-xs text-muted-foreground">
          Bấm trực tiếp trên bản đồ để chọn tọa độ cho cửa hàng. Marker sẽ tự
          động di chuyển và cập nhật Latitude/Longitude phía dưới.
        </p>
        <div
          className={`${heightClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800`}
        >
          {mapMounted ? (
            <MapContainer
              center={currentPosition}
              zoom={hasValidCoords ? 17 : 13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                url={tileUrl}
                attribution={tileAttribution}
                eventHandlers={{
                  tileerror: () => {
                    // Thử đổi provider khi tile bị lỗi (mạng/adblock/cors)
                    if (tileUrl === CARTO_TILE_URL) {
                      setTileUrl(OSM_TILE_URL);
                      setTileAttribution(OSM_ATTRIBUTION);
                    } else {
                      setTileUrl(CARTO_TILE_URL);
                      setTileAttribution(CARTO_ATTRIBUTION);
                    }
                  },
                }}
              />
              <MapAutoResize />
              <LocationSelector />
            </MapContainer>
          ) : (
            <div className="h-full w-full bg-muted animate-pulse" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="store-latitude" className="text-xs">
            Latitude
          </Label>
          <Input
            id="store-latitude"
            placeholder="10.7769"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="store-longitude" className="text-xs">
            Longitude
          </Label>
          <Input
            id="store-longitude"
            placeholder="106.7009"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>
    </div>
  );
}

