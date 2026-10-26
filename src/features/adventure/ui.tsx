import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { directions, type Direction } from "./model";
export function AdventureBack() {
  return (
    <Link className="back" to="/adventure">
      <ChevronLeft size={18} /> Przygoda z pétanque
    </Link>
  );
}
export function AdventureHeading({
  title,
  subtitle,
  eyebrow = "ROŚNIJ Z KAŻDĄ KULĄ",
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
    </div>
  );
}
export function DirectionPicker({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: Direction | null;
  onChange: (d: Direction) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <fieldset className="direction-picker">
      <legend>{label}</legend>
      <div>
        {directions.map((d) => (
          <button
            type="button"
            key={d.id}
            disabled={disabled}
            aria-pressed={value === d.id}
            data-direction={d.id}
            onClick={() => onChange(d.id)}
          >
            <span aria-hidden="true">{d.symbol}</span>
            {d.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
export function ShotFigure({ figure }: { figure: number }) {
  return (
    <svg
      className="shot-figure"
      viewBox="0 0 180 200"
      role="img"
      aria-label={`Figura ${figure}, widok z góry. Rzut od dołu. Biała kula celu, ciemne przeszkody, mała pomarańczowa świnka.`}
    >
      <circle
        cx="90"
        cy="85"
        r="70"
        fill="#f7e6b1"
        stroke="#202635"
        strokeWidth="2"
      />
      {figure !== 5 && (
        <circle
          cx="90"
          cy="85"
          r="12"
          fill="white"
          stroke="#202635"
          strokeWidth="2"
        />
      )}
      {figure === 2 && <circle cx="90" cy="119" r="5" fill="#a84b20" />}
      {figure === 3 && (
        <>
          <circle cx="55" cy="85" r="12" fill="#202635" />
          <circle cx="125" cy="85" r="12" fill="#202635" />
        </>
      )}
      {figure === 4 && <circle cx="90" cy="127" r="12" fill="#202635" />}
      {figure === 5 && <circle cx="90" cy="127" r="5" fill="#a84b20" />}
      <path
        d="M90 190V167m-5 7 5-7 5 7"
        fill="none"
        stroke="#202635"
        strokeWidth="3"
      />
    </svg>
  );
}
