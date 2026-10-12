import {
  mentalCompetencies,
  mentalLevels,
  type MentalCompetency,
  type MentalLevel,
} from "./catalog";
export function MentalFilters({
  competency,
  level,
  onCompetency,
  onLevel,
}: {
  competency: MentalCompetency | "all";
  level: MentalLevel | "all";
  onCompetency: (value: MentalCompetency | "all") => void;
  onLevel: (value: MentalLevel | "all") => void;
}) {
  return (
    <div className="mental-filters">
      <label>
        Kompetencja
        <select
          aria-label="Kompetencja"
          value={competency}
          onChange={(e) =>
            onCompetency(e.target.value as MentalCompetency | "all")
          }
        >
          <option value="all">Wszystkie kompetencje</option>
          {mentalCompetencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Poziom mentalny
        <select
          aria-label="Poziom mentalny"
          value={level}
          onChange={(e) => onLevel(e.target.value as MentalLevel | "all")}
        >
          <option value="all">Wszystkie poziomy</option>
          {mentalLevels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
