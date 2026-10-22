import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { useApp } from "../../app-context";

// Installation preference: deliberately independent of app versions, backups
// and training history. Service worker updates must never reset this key.
const seenKey = "jedna-kula-profile-prompt-seen";

export function ProfilePrompt() {
  const { state } = useApp();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showOnce = () => {
      try {
        if (localStorage.getItem(seenKey)) return;
        // Persist before showing, even if the player skips the profile.
        localStorage.setItem(seenKey, "1");
        setVisible(!state.player && pathname !== "/profile");
      } catch {
        // Without durable storage we cannot guarantee a one-time prompt.
      }
    };
    const standalone = window.matchMedia("(display-mode: standalone)");
    if (
      standalone.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone
    )
      showOnce();
    const onDisplayChange = () => {
      if (standalone.matches) showOnce();
    };
    window.addEventListener("appinstalled", showOnce);
    standalone.addEventListener("change", onDisplayChange);
    return () => {
      window.removeEventListener("appinstalled", showOnce);
      standalone.removeEventListener("change", onDisplayChange);
    };
  }, [state.player, pathname]);

  if (!visible || state.player || pathname === "/profile") return null;
  return (
    <section className="onboarding" aria-label="Uzupełnij profil">
      <User size={22} aria-hidden="true" />
      <span>
        <b>Uzupełnij profil</b>
        Wybierz, jak dziś grasz i co chcesz osiągnąć. Możesz też zrobić to
        później w zakładce „Twój profil”.
      </span>
      <div className="profile-prompt-actions">
        <Link
          className="secondary"
          to="/profile"
          onClick={() => setVisible(false)}
        >
          Uzupełnij
        </Link>
        <button className="text-button" onClick={() => setVisible(false)}>
          Później
        </button>
      </div>
    </section>
  );
}
