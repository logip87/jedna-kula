import { useState, type ReactNode } from "react";

// Enabled only for the counting lesson; normal match play keeps its existing flow.
export function CountBeforeChoice({
  own,
  opponent,
  enabled,
  children,
}: {
  own: number;
  opponent: number;
  enabled: boolean;
  children: ReactNode;
}) {
  const [ours, setOurs] = useState("");
  const [theirs, setTheirs] = useState("");
  if (!enabled) return <>{children}</>;
  const ready =
    ours !== "" &&
    theirs !== "" &&
    Number(ours) === own &&
    Number(theirs) === opponent;
  return (
    <section className="card config">
      <h3>Policz przed decyzją</h3>
      <p>
        W tej sytuacji rywal ma punkt. Sprawdź podaną liczbę pozostałych kul obu
        drużyn. Dopiero potem wybierz zagranie i rozważ odpowiedź rywala.
      </p>
      <label>
        Nasze pozostałe kule
        <input
          type="number"
          min="0"
          max="6"
          value={ours}
          onChange={(e) => setOurs(e.target.value)}
        />
      </label>
      <label>
        Pozostałe kule rywala
        <input
          type="number"
          min="0"
          max="6"
          value={theirs}
          onChange={(e) => setTheirs(e.target.value)}
        />
      </label>
      <p role="status">
        {ready
          ? "Liczby się zgadzają. Co zyskasz i co ryzykujesz?"
          : "Sprawdź obie liczby w opisie sytuacji."}
      </p>
      {ready && children}
    </section>
  );
}
