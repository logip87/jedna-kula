import { useEffect, useRef, useState } from "react";

export function DistanceChange({ distance }: { distance: number }) {
  const previousDistance = useRef(distance);
  const [notice, setNotice] = useState<{ distance: number } | null>(null);

  useEffect(() => {
    if (previousDistance.current === distance) return;
    previousDistance.current = distance;
    setNotice({ distance });
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [distance]);

  return (
    <div
      className="distance-change"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {notice?.distance === distance && (
        <div className="distance-change-card" key={distance}>
          <span>Nowa odległość</span>
          <strong>
            {distance}
            <small> m</small>
          </strong>
        </div>
      )}
    </div>
  );
}
