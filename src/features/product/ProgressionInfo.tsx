import { type Session } from "../../domain";

export function ProgressionInfo({
  session,
  isTest = false,
  fixedPlan,
}: {
  session?: Session;
  distances?: number[];
  drillId?: string;
  isTest?: boolean;
  fixedPlan?: "precision" | "duel";
}) {
  if (
    !session?.mastery &&
    !session?.challenge &&
    session?.kind !== "test" &&
    !isTest &&
    !fixedPlan
  )
    return null;
  return (
    <section className="card" aria-label="Zasady awansu">
      <h2>Zasady zaliczenia</h2>
      <p>
        {fixedPlan === "precision"
          ? "Strzał precyzyjny ma ustaloną kolejność figur i odległości 6–9 m. Kolejny dystans wynika z planu, bez progu skuteczności. Wyniki tego trybu nie uruchamiają awansu w zwykłym treningu."
          : fixedPlan === "duel"
            ? "W grze we dwoje sami wybieracie odległość przed rozpoczęciem. Wynik pojedynku lub wspólny cel nie uruchamia automatycznej propozycji awansu."
            : session?.mastery
              ? `Poziom ${session.mastery.tier === "mastery" ? "Mastery" : "Legendary"}: minimum 8 trafień na 10 prób (80%). Po zaliczeniu Mastery odblokujesz Legendary.`
              : session?.challenge
                ? "To wyzwanie ma własny cel podany w instrukcji. Jego wynik nie uruchamia propozycji zmiany odległości."
                : "Test ma ustalony plan i służy porównaniu wyników."}
      </p>
    </section>
  );
}
