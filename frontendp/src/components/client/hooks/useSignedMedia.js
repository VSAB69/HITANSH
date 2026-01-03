import { useEffect, useRef, useState } from "react";
import { appApiClient } from "../../../api/endpoints";

export const useSignedMedia = (key) => {
  const [url, setUrl] = useState(null);
  const refreshTimer = useRef(null);

  const fetchUrl = async () => {
    if (!key) return;

    const res = await appApiClient.get(
      `/api/media/secure/?key=${encodeURIComponent(key)}`
    );

    setUrl(res.data.url);

    // Refresh at 80% of expiry time
    const refreshInMs = res.data.expires_in * 0.8 * 1000;

    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(fetchUrl, refreshInMs);
  };

  useEffect(() => {
    fetchUrl();

    return () => {
      clearTimeout(refreshTimer.current);
    };
  }, [key]);

  return url;
};
