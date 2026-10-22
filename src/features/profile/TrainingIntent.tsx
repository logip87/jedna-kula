import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../app-context";
import {
  initialLevel,
  playingStyles,
  trainingGoals,
  type PlayingStyle,
  type TrainingGoal,
} from "./intent";

export function IntentFields({
  style,
  goal,
  onStyle,
  onGoal,
}: {
  style: PlayingStyle | "";
  goal: TrainingGoal | "";
  onStyle: (value: PlayingStyle | "") => void;
  onGoal: (value: TrainingGoal | "") => void;
}) {
  return (
    <>
      <label>
        Jak dziś grasz?
        <select
          value={style}
          onChange={(e) => onStyle(e.target.value as typeof style)}
        >
          <option value="">Wybierz, jeśli chcesz</option>
          {Object.entries(playingStyles).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Co chcesz osiągnąć?
        <select
          value={goal}
          onChange={(e) => onGoal(e.target.value as typeof goal)}
        >
          <option value="">Wybierz, jeśli chcesz</option>
          {Object.entries(trainingGoals).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function TrainingIntent() {
  const { state, save, busy } = useApp();
  const [style, setStyle] = useState<PlayingStyle | "">(
    state.player?.playingStyle ?? "",
  );
  const [goal, setGoal] = useState<TrainingGoal | "">(
    state.player?.trainingGoal ?? "",
  );
  const [skipped, setSkipped] = useState(() => {
    try {
      return localStorage.getItem("jedna-kula-intent-skipped") === "1";
    } catch {
      return false;
    }
  });
  if (state.player?.playingStyle || state.player?.trainingGoal) return null;
  if (skipped)
    return (
      <p className="muted small">
        Możesz dopasować trening w <Link to="/profile">swoim profilu</Link>.
      </p>
    );
  return (
    <details
      className="card config profile-form rules-notes"
      open={
        !state.player && !state.sessions.some((session) => session.completedAt)
      }
    >
      <summary>Zacznij od swojego celu</summary>
      <p>
        Dwa krótkie pytania pomogą wybrać pierwszy krok. Bez konta i rankingu.
        Możesz je pominąć lub zmienić odpowiedzi w profilu.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const level =
            state.player?.level ??
            (state.player?.audience === "athlete"
              ? "advanced"
              : style
                ? initialLevel(style)
                : "beginner");
          await save({
            ...state,
            player: {
              id: crypto.randomUUID(),
              name: "",
              preferredRole: "wszechstronny",
              preferredHand: "prawa",
              createdAt: new Date().toISOString(),
              audience: level === "tournament" ? "athlete" : "beginner",
              level,
              ...state.player,
              playingStyle: style || undefined,
              trainingGoal: goal || undefined,
            },
          });
        }}
      >
        <IntentFields
          style={style}
          goal={goal}
          onStyle={setStyle}
          onGoal={setGoal}
        />
        <button className="button" disabled={busy || (!style && !goal)}>
          Dopasuj trening
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            try {
              localStorage.setItem("jedna-kula-intent-skipped", "1");
            } catch {
              /* Skip also works without storage. */
            }
            setSkipped(true);
          }}
        >
          Później — przejdź do treningu
        </button>
      </form>
    </details>
  );
}
