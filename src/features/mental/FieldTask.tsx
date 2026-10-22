import { selectFieldTask } from "./cue";
import { Link } from "react-router-dom";
import { useApp } from "../../app-context";
import type { Session } from "../../domain";
import { mentalLessons } from "./catalog";

export const reflectionLabels = {
  applied: "Zastosowane",
  repeat: "Chcę powtórzyć",
  "no-opportunity": "Nie było okazji",
} as const;

export function FieldTaskAction({ lessonId }: { lessonId: string }) {
  const { state, save, busy } = useApp();
  const lesson = mentalLessons.find((l) => l.id === lessonId)!;
  const pending = state.coaching?.pendingMentalCueLessonId === lessonId;
  const evidence = state.sessions.filter(
    (s) =>
      s.completedAt && s.mentalCueLessonId === lessonId && s.lessonReflection,
  );
  return (
    <section className="card config">
      <h2>Lekcja → boisko</h2>
      <p>{lesson.exercise}</p>
      <p className="muted">
        Po treningu: {lesson.reflection} Samo przeczytanie nie potwierdza
        zastosowania.
      </p>
      <button
        className="button"
        disabled={busy || pending}
        onClick={() => void save(selectFieldTask(state, lessonId))}
      >
        {pending
          ? "Zadanie wybrane do następnego treningu"
          : "Wybierz zadanie na boisko"}
      </button>
      {pending && (
        <p role="status">
          Zadanie pojawi się w następnym nowym treningu. Wznowiony trening
          zachowuje swój cel.
        </p>
      )}
      <Link className="secondary" to="/training">
        Wypróbuj na treningu
      </Link>
      {lesson.scenarioId && (
        <>
          <Link
            className="secondary"
            to={`/adventure/tactics?case=${lesson.scenarioId}&lesson=${lesson.id}`}
          >
            Przeanalizuj powiązaną sytuację
          </Link>
          <Link
            className="secondary"
            to={`/coach/match?case=${lesson.scenarioId}&lesson=${lesson.id}`}
          >
            Ćwicz tę decyzję w trybie meczowym
          </Link>
        </>
      )}
      {lesson.id === "confidence-series" && (
        <Link className="text-link" to="/progress">
          Porównaj serie w statystykach
        </Link>
      )}
      {evidence.length > 0 && (
        <p>
          Ostatnia refleksja:{" "}
          {reflectionLabels[evidence.at(-1)!.lessonReflection!]}. Treningów z
          refleksją: {evidence.length}.
        </p>
      )}
    </section>
  );
}

export function FieldReflection({
  session,
  value,
  onChange,
  readonly = false,
}: {
  session: Session;
  value?: Session["lessonReflection"];
  onChange?: (value: Session["lessonReflection"]) => void;
  readonly?: boolean;
}) {
  const { state, save, busy } = useApp();
  const lesson = mentalLessons.find((l) => l.id === session.mentalCueLessonId);
  if (!lesson) return null;
  return (
    <section className="card config" aria-label="Refleksja po zadaniu">
      <h2>Zadanie z boiska: {lesson.title}</h2>
      <p>{lesson.exercise}</p>
      <p>{lesson.reflection}</p>
      {readonly ? (
        <>
          <p>
            {value
              ? reflectionLabels[value]
              : "Brak refleksji — zadanie nie jest potwierdzone."}
          </p>
          <button
            className="secondary"
            disabled={
              busy || state.coaching?.pendingMentalCueLessonId === lesson.id
            }
            onClick={() => void save(selectFieldTask(state, lesson.id))}
          >
            Powtórz zadanie w kolejnym treningu
          </button>
        </>
      ) : (
        <label>
          Refleksja (opcjonalnie)
          <select
            value={value ?? ""}
            onChange={(e) =>
              onChange?.(
                (e.target.value || undefined) as Session["lessonReflection"],
              )
            }
          >
            <option value="">Bez odpowiedzi</option>
            {Object.entries(reflectionLabels).map(([id, text]) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
      )}
      <Link className="text-link" to={`/lessons/${lesson.id}`}>
        Wróć do lekcji
      </Link>
    </section>
  );
}
