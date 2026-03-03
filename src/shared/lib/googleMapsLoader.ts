let googleMapsPromise: Promise<typeof window.google> | null = null;

export function loadGoogleMapsPlaces(): Promise<typeof window.google> {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(
      new Error("VITE_GOOGLE_MAPS_API_KEY is not configured in frontend env."),
    );
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      resolve((window as any).google);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google?.maps?.places) {
        resolve((window as any).google);
      } else {
        reject(
          new Error("Google Maps Places API loaded but window.google is missing."),
        );
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps Places script."));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

