import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Compass } from "lucide-react";
export function BeginnerGuide() {
  return (
    <details className="beginner-guide">
      <summary>
        <span className="guide-icon">
          <Compass size={24} />
        </span>
        <span>
          <b>Pierwszy raz z pétanque?</b>
          <small>Trzy proste rzeczy i możesz zaczynać.</small>
        </span>
        <span className="guide-toggle">
          <ChevronRight size={21} />
        </span>
      </summary>
      <div className="guide-body">
        <svg
          viewBox="0 0 480 170"
          role="img"
          aria-label="Rzucasz z koła w stronę małej świnki. Celem puenty jest zatrzymanie kuli blisko niej."
        >
          <rect x="10" y="10" width="460" height="145" rx="20" fill="#eee9df" />
          <circle
            cx="70"
            cy="84"
            r="32"
            fill="none"
            stroke="#6d6d65"
            strokeWidth="3"
          />
          <path
            d="M110 84h175"
            stroke="#a48551"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <path
            d="m273 77 12 7-12 7"
            stroke="#a48551"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="338"
            cy="84"
            r="31"
            stroke="#a48551"
            strokeDasharray="4 5"
            fill="none"
          />
          <circle cx="328" cy="90" r="13" fill="#6d6355" />
          <circle cx="350" cy="77" r="7" fill="#c55732" />
          <text x="45" y="140" fill="#564d42" fontSize="15">
            Koło
          </text>
          <text x="300" y="140" fill="#564d42" fontSize="15">
            Kula + świnka
          </text>
        </svg>
        <div className="guide-steps">
          <div>
            <b>01 · Poznaj cel</b>
            <p>
              Świnka to mała kulka. W puencie chcesz położyć swoją kulę jak
              najbliżej niej.
            </p>
          </div>
          <div>
            <b>02 · Spróbuj 6 razy</b>
            <p>
              Stań w kole, wybierz cel i rzuć. Po każdym rzucie zaznacz wynik w
              aplikacji.
            </p>
          </div>
          <div>
            <b>03 · Daj sobie czas</b>
            <p>
              Pudła też uczą. Strzał to wybicie kuli rywala, a carreau — gdy
              Twoja zostaje w jej miejscu.
            </p>
          </div>
        </div>
        <Link className="button" to="/training/point-basic?level=easy">
          Mój pierwszy trening <ArrowRight size={20} />
        </Link>
      </div>
    </details>
  );
}
