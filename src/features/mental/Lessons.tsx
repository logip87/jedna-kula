import { mentalRecommendation } from "../product/model";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ArrowUpRight, BookOpen } from "lucide-react";
import { useApp } from "../../app-context";
import {
  mentalCompetencies,
  mentalLevels,
  mentalLessons,
  completedMentalLessons,
  routineDescription,
  type MentalCompetency,
  type MentalLevel,
} from "./catalog";
import { MentalFilters } from "./Filters";
export function LessonList() {
  const { state } = useApp();
  const [params, setParams] = useSearchParams();
  const competency =
    mentalCompetencies.find((c) => c.id === params.get("competency"))?.id ??
    "all";
  const level =
    mentalLevels.find((l) => l.id === params.get("level"))?.id ?? "all";
  const setFilter = (
    key: string,
    value: MentalCompetency | MentalLevel | "all",
  ) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };
  const done = completedMentalLessons(state.lessons);
  const recommendation = mentalRecommendation(state);
  const pending = mentalLessons.find(
    (l) => l.id === state.coaching?.pendingMentalCueLessonId,
  );
  const next =
    pending ??
    mentalLessons.find((l) => l.id === recommendation?.lessonId) ??
    mentalLessons.find((l) => !state.lessons.includes(l.id)) ??
    mentalLessons[0];
  const current = mentalCompetencies.find((c) => c.id === next.competency)!;
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">PRZYGOTOWANIE DO GRY</p>
        <h1>Trening mentalny</h1>
        <p className="muted">
          Pięć kompetencji. Trzy poziomy. Wybierz zadanie i sprawdź je na
          boisku.
        </p>
      </div>
      <section className="card">
        <h2>Plan → Oddech → Wykonanie → Reset</h2>
        <p>{routineDescription}</p>
        <p className="muted">
          Każdy poziom jest dostępny niezależnie od wieku i profilu.
        </p>
        <Link className="secondary" to="/coach/practice/mental">
          Ćwiczenia mentalne w praktyce
        </Link>
      </section>
      <div className="lesson-progress">
        <BookOpen />
        <b>
          {done} / {mentalLessons.length} zaliczonych
        </b>
        <progress
          aria-label="Zaliczone lekcje"
          value={done}
          max={mentalLessons.length}
        />
      </div>
      <section className="card config">
        <p className="eyebrow">
          {pending ? "TWOJE ZADANIE NA BOISKO" : "NASTĘPNY TEMAT"}
        </p>
        <h2>{next.title}</h2>
        {recommendation && !pending && <p>{recommendation.reason}</p>}
        <p>{next.exercise}</p>
        <Link className="button" to={`/lessons/${next.id}`}>
          Otwórz temat
        </Link>
      </section>
      <section className="card">
        <h2>Aktualny moduł: {current.name}</h2>
        <p>{current.goal}</p>
        <div className="lesson-grid">
          {mentalLessons
            .filter((l) => l.competency === current.id)
            .map((l) => (
              <Link className="secondary" to={`/lessons/${l.id}`} key={l.id}>
                {l.title}
                {state.lessons.includes(l.id) ? " · przeczytane" : ""}
              </Link>
            ))}
        </div>
      </section>
      <details
        className="card"
        open={params.has("competency") || params.has("level") || undefined}
      >
        <summary>Pełna biblioteka · {mentalLessons.length} lekcji</summary>
        <MentalFilters
          competency={competency}
          level={level}
          onCompetency={(v) => setFilter("competency", v)}
          onLevel={(v) => setFilter("level", v)}
        />
        {mentalCompetencies
          .filter((c) => competency === "all" || c.id === competency)
          .map((c) => {
            const items = mentalLessons.filter(
              (l) =>
                l.competency === c.id && (level === "all" || l.level === level),
            );
            return (
              <section
                className="mental-competency"
                key={c.id}
                aria-labelledby={`competency-${c.id}`}
              >
                <h2 id={`competency-${c.id}`}>{c.name}</h2>
                <p className="muted">{c.goal}</p>
                <p>
                  {
                    mentalLessons.filter(
                      (l) =>
                        l.competency === c.id && state.lessons.includes(l.id),
                    ).length
                  }{" "}
                  / {mentalLessons.filter((l) => l.competency === c.id).length}{" "}
                  lekcji zaliczonych
                </p>
                <div className="lesson-grid">
                  {items.map((l) => (
                    <Link
                      className={`card lesson-card ${state.lessons.includes(l.id) ? "lesson-done" : ""}`}
                      key={l.id}
                      to={`/lessons/${l.id}`}
                    >
                      <div>
                        <p className="eyebrow">
                          {
                            mentalLevels.find((level) => level.id === l.level)
                              ?.name
                          }
                        </p>
                        <h3>{l.title}</h3>
                        <p className="muted">{l.phrase}</p>
                      </div>
                      {state.lessons.includes(l.id) ? (
                        <Check className="check" aria-label="Zaliczone" />
                      ) : (
                        <ArrowUpRight size={22} />
                      )}
                    </Link>
                  ))}
                </div>
                {!items.length && (
                  <p>
                    Brak lekcji dla wybranego poziomu. Wybierz wszystkie
                    poziomy.
                  </p>
                )}
              </section>
            );
          })}
      </details>
    </>
  );
}
