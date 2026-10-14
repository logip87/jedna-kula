import { type Session } from "../../domain";
import { useApp } from "../../app-context";
import { audience, masteryDrills } from "../development/model";
import {
  progressionThreshold,
  progressionSessions,
  progressionAttempts,
  progressionWindowDays,
} from "./progression";

export function ProgressionInfo({
  session,
  distances = [6],
  drillId,
  isTest = false,
  fixedPlan,
}: {
  session?: Session;
  distances?: number[];
  drillId?: string;
  isTest?: boolean;
  fixedPlan?: "precision" | "duel";
}) {
  const { state } = useApp();
  const maximum = audience(state) === "junior" ? 7 : 10;
  const currentDistances = [
    ...new Set(session?.plan.map((a) => a.distance) ?? distances),
  ];
  const special =
    session?.mastery ||
    session?.challenge ||
    session?.kind === "test" ||
    isTest ||
    fixedPlan;
  const hasMastery = masteryDrills.includes(session?.drillId ?? drillId ?? "");
  return (
    <section className="card" aria-label="Zasady awansu">
      <h2>Kiedy kolejny poziom?</h2>
      {special ? (
        <p>
          {fixedPlan === "precision"
            ? "Strzał precyzyjny ma ustaloną kolejność figur i odległości 6–9 m. Kolejny dystans wynika z planu, bez progu skuteczności. Wyniki tego trybu nie uruchamiają awansu w zwykłym treningu."
            : fixedPlan === "duel"
              ? "W grze we dwoje sami wybieracie odległość przed rozpoczęciem. Wynik pojedynku lub wspólny cel nie uruchamia automatycznej propozycji awansu."
              : session?.mastery
                ? `Poziom ${session.mastery.tier === "mastery" ? "Mastery" : "Legendary"}: minimum 8 trafień na 10 prób (80%). Po zaliczeniu Mastery odblokujesz Legendary.`
                : session?.challenge
                  ? "To wyzwanie ma własny cel podany w instrukcji. Jego wynik nie uruchamia propozycji zmiany odległości."
                  : "Test ma ustalony plan i służy porównaniu wyników. Propozycję zmiany odległości wypracujesz w zwykłym treningu."}
        </p>
      ) : (
        <>
          <p>
            {currentDistances.map((distance) => (
              <span key={distance}>
                <b>
                  {distance} m: minimum {progressionThreshold(distance)}%
                </b>
                {distance < maximum
                  ? `, żeby otrzymać propozycję ${distance + 1} m. `
                  : ", żeby otrzymać propozycję treningu pod presją na tym samym dystansie. "}
              </span>
            ))}
          </p>
          <p>
            Liczą się {progressionSessions} ostatnie pełne sesje z ostatnich{" "}
            {progressionWindowDays} dni, każda z minimum {progressionAttempts}{" "}
            rzutami w danym wariancie i wymaganą skutecznością. Porównujemy ten
            sam rodzaj ćwiczenia, dystans, trudność, cel i nawierzchnię. Przy
            kilku dystansach lub rodzajach rzutów każdy wariant liczymy osobno.
          </p>
          <p>
            Propozycja pojawi się na ekranie „Dzisiaj”, gdy ten wariant będzie
            rekomendowany. Wybierz „Spróbuj trudniej”, żeby ją przyjąć.
          </p>
        </>
      )}
      <p className="muted small">
        Progi dystansu w zwykłym treningu:{" "}
        {[6, 7, 8, 9]
          .map((d) => `${d} m — ${progressionThreshold(d)}%`)
          .join(", ")}
        . Skuteczność to procent trafień; dla lobu liczy się trafienie w
        lądowanie. To propozycja — odległość możesz też wybrać sam w
        ustawieniach ćwiczenia.
      </p>
      {hasMastery && !special && (
        <p className="muted small">
          Mastery odblokujesz po 2 pełnych sesjach w tych samych warunkach,
          łącznie minimum 20 prób i co najmniej 60% trafień w każdej sesji.
          Zaliczenie Mastery i Legendary wymaga 8/10 (80%).
        </p>
      )}
    </section>
  );
}
