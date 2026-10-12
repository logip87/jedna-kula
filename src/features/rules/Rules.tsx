import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  ChevronLeft,
  Search,
  BookOpen,
  Target,
  CircleDot,
  Focus,
  Crosshair,
  Trophy,
  Flag,
  Ruler,
  Mountain,
  Timer,
  ShieldAlert,
  Circle,
  Users,
  Medal,
  HelpCircle,
  Sparkles,
  Check,
  X,
  ExternalLink,
  WifiOff,
} from "lucide-react";
import { useApp } from "../../app-context";
import { categories, rules, findRule, quickHelp, sources } from "./catalog";
import {
  contentVersion,
  jackOutResult,
  normalize,
  verifiedOn,
  type Rule,
} from "./model";
import { newQuiz, questions, quizScore } from "./quiz";
import { BoundaryDiagrams, ShootingDiagrams } from "./diagrams";
const icons: Record<string, typeof Target> = {
  Target,
  CircleDot,
  Focus,
  Crosshair,
  Trophy,
  Flag,
  Ruler,
  Mountain,
  Timer,
  ShieldAlert,
  Circle,
  Users,
  Medal,
  HelpCircle,
  Sparkles,
};
const displayDate = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("pl-PL");
const Back = () => (
  <Link className="back" to="/rules">
    <ChevronLeft size={18} /> Zasady gry
  </Link>
);
function Trust() {
  return (
    <p className="rule-trust">
      <Check size={16} /> Przepisy zweryfikowane na: {displayDate(verifiedOn)}
    </p>
  );
}
function Source({ rule }: { rule: Rule }) {
  const references = [
    { sourceId: rule.sourceId, article: rule.sourceArticle },
    ...(rule.additionalSources ?? []),
  ];
  return (
    <div className="rule-source">
      {references.map((ref, index) => {
        const source = sources[ref.sourceId];
        return (
          <section key={ref.sourceId}>
            <b>
              {index === 0 ? "Źródło" : "Dodatkowe źródło"}: {source.name}
              {ref.article && `, ${ref.article}`}
            </b>
            <span>
              Data dokumentu: {displayDate(source.date)} · weryfikacja:{" "}
              {displayDate(verifiedOn)}
            </span>
            <div>
              <a
                href={`/rule-sources/${source.file}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Dokument PDF <WifiOff size={14} />
              </a>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                Oryginał PFP <ExternalLink size={14} />
              </a>
            </div>
          </section>
        );
      })}
    </div>
  );
}
function Badges({ rule }: { rule: Rule }) {
  return (
    <div className="rule-badges">
      {rule.competitionSpecific && (
        <span>Dotyczy tylko konkretnych zawodów</span>
      )}
      {rule.badge && <span>{rule.badge}</span>}
      {rule.verification && (
        <span className="unverified">Wymaga weryfikacji</span>
      )}
    </div>
  );
}
function RuleLink({ rule }: { rule: Rule }) {
  return (
    <Link
      className="rule-list-card"
      data-rule-id={rule.id}
      to={`/rules/rule/${rule.id}`}
    >
      <div>
        <Badges rule={rule} />
        <h2>{rule.title}</h2>
        <p>{rule.shortAnswer}</p>
      </div>
      <ArrowRight size={20} aria-hidden="true" />
    </Link>
  );
}
export function RulesHome() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const terms = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const found = rules.filter((r) =>
    terms.every((t) =>
      normalize(
        [r.title, r.shortAnswer, r.explanation, ...r.tags].join(" "),
      ).includes(t),
    ),
  );
  return (
    <div className="rules-page">
      <div className="page-heading">
        <p className="eyebrow">PEWNIEJ NA BOISKU</p>
        <h1>Zasady gry</h1>
        <p className="muted">Krótka odpowiedź. Jasny ruch. Spokojna gra.</p>
      </div>
      <Trust />
      <label className="rules-search">
        <Search size={22} />
        <input
          aria-label="Znajdź zasadę"
          placeholder="Znajdź zasadę, np. świnka na aucie"
          value={query}
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, {
              replace: true,
            })
          }
        />
        {query && (
          <button
            aria-label="Wyczyść wyszukiwanie"
            onClick={() => setParams({})}
          >
            <X size={18} />
          </button>
        )}
      </label>
      {query ? (
        <>
          <p role="status">Znaleziono: {found.length}</p>
          <div className="rule-list">
            {found.map((r) => (
              <RuleLink key={r.id} rule={r} />
            ))}
          </div>
          {!found.length && (
            <div className="card">
              <h2>Spróbuj krócej</h2>
              <p>Wpisz „kółko”, „czas” lub „65 mm”.</p>
              <button className="secondary" onClick={() => setParams({})}>
                Pokaż wszystkie kategorie
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <Link to="/rules/quick" className="rules-help-hero">
            <span className="eyebrow">POTRZEBUJESZ ODPOWIEDZI TERAZ?</span>
            <h2>Co się dzieje, gdy…?</h2>
            <p>14 sytuacji z boiska. Znajdź swoją.</p>
            <span className="rules-hero-arrow">
              <ArrowRight size={26} />
            </span>
          </Link>
          <div className="rules-categories">
            {categories.map((cat, i) => {
              const Icon = icons[cat.icon] ?? BookOpen;
              return (
                <Link
                  key={cat.id}
                  to={
                    cat.id === "quiz"
                      ? "/rules/quiz"
                      : `/rules/category/${cat.id}`
                  }
                  className={`rules-category tone-${i % 4}`}
                >
                  <span className="rules-category-icon">
                    <Icon size={24} />
                    <small>{String(i + 1).padStart(2, "0")}</small>
                  </span>
                  <h2>{cat.title}</h2>
                  <p>{cat.description}</p>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
          <details className="rules-notes">
            <summary>Jak czytać źródła i wyjątki?</summary>
            <p>
              Najpierw obowiązują przepisy gry. Nowszy regulamin szczegółowy
              stosujemy w jego zakresie. Np. MPSP z 03.04.2026 ma pierwszeństwo
              przed starszym opisem strzału w systemach turniejowych.
            </p>
            <p>
              Wiek dokumentu nie oznacza, że przestał obowiązywać. Ogólny
              regulamin PFP jest tłumaczeniem zasad FIPJP obowiązujących od 2021
              r. Przewodnik opiera się na dokumentach aktualnie udostępnianych
              przez federacje.
            </p>
            <p>
              Niepotwierdzone warunki oznaczamy „Wymaga weryfikacji”; nie są
              używane do oceniania quizu. Kopie PDF są dostępne offline po
              przygotowaniu aplikacji do pracy bez internetu.
            </p>
          </details>
        </>
      )}
    </div>
  );
}
export function RulesCategory() {
  const { category } = useParams();
  const cat = categories.find((c) => c.id === category);
  if (!cat)
    return (
      <>
        <Back />
        <h1>Nie znaleziono kategorii</h1>
      </>
    );
  let items = rules.filter((r) => r.category === category);
  if (category === "equipment") items = [...items, findRule("junior-boules")!];
  return (
    <div className="rules-page">
      <Back />
      <div className="page-heading">
        <p className="eyebrow">ZASADY W PRAKTYCE</p>
        <h1>{cat.title}</h1>
        <p className="muted">{cat.description}</p>
      </div>
      <Trust />
      {category === "out" && (
        <>
          <BoundaryDiagrams />
          <JackDecision />
        </>
      )}
      {category === "shooting" && (
        <>
          <ShootingDiagrams />
          <Source rule={findRule("shoot-format")!} />
        </>
      )}
      {category === "tournaments" ? (
        <>
          <div className="rule-list">
            {items
              .filter((r) => !r.id.startsWith("mp-"))
              .map((r) => (
                <RuleLink key={r.id} rule={r} />
              ))}
          </div>
          <h2 className="rules-section-title">Mistrzostwa Polski</h2>
          <p className="muted">
            Przykłady regulaminów zawodów. Sprawdź konkurencję i etap.
          </p>
          <div className="rule-list">
            {[
              ...items.filter((r) => r.id.startsWith("mp-")),
              findRule("mp-juniors")!,
              findRule("shoot-format")!,
            ].map((r) => (
              <RuleLink key={r.id} rule={r} />
            ))}
          </div>
        </>
      ) : (
        <div className="rule-list">
          {items.map((r) => (
            <RuleLink key={r.id} rule={r} />
          ))}
        </div>
      )}
    </div>
  );
}
function JackDecision() {
  const [choice, setChoice] = useState<"both" | "one" | "none">("both");
  const [count, setCount] = useState(2);
  const result = jackOutResult(choice, count);
  return (
    <section className="jack-decision" aria-labelledby="jack-decision-title">
      <p className="eyebrow">SZYBKA DECYZJA · ART. 14</p>
      <h2 id="jack-decision-title">Świnka wypadła na aut. Co teraz?</h2>
      <p>Komu zostały niewyrzucone kule?</p>
      <div className="jack-choices">
        {(
          [
            { id: "both", label: "Obu drużynom" },
            { id: "one", label: "Tylko jednej" },
            { id: "none", label: "Żadnej" },
          ] as const
        ).map((x) => (
          <button
            key={x.id}
            aria-pressed={choice === x.id}
            onClick={() => setChoice(x.id)}
          >
            {x.label}
          </button>
        ))}
      </div>
      {choice === "one" && (
        <label className="remaining-boules">
          Ile kul ma ta drużyna?
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="jack-result" role="status">
        <strong>
          {result.points} <small>pkt</small>
        </strong>
        <p>{result.message}</p>
      </div>
      <p className="muted">
        Przy anulowaniu prawo rzutu świnką zachowuje poprzednia drużyna
        rozpoczynająca.
      </p>
      <Source rule={findRule("jack-out")!} />
    </section>
  );
}
export function RuleDetail() {
  const { id } = useParams();
  const rule = findRule(id ?? "");
  const situation = quickHelp.find((q) => q.ruleId === id)?.situation;
  if (!rule)
    return (
      <>
        <Back />
        <h1>Nie znaleziono zasady</h1>
        <Link to="/rules">Znajdź inną zasadę</Link>
      </>
    );
  return (
    <article className="rules-page">
      <Back />
      <Badges rule={rule} />
      <div className="page-heading">
        <p className="eyebrow">
          {categories.find((c) => c.id === rule.category)?.title}
        </p>
        <h1>{rule.title}</h1>
      </div>
      {situation && (
        <div className="rule-situation">
          <small>SYTUACJA</small>
          <p>{situation}</p>
          <ArrowDown size={20} />
        </div>
      )}
      {rule.verification && (
        <div className="verification-note" role="note">
          <b>Wymaga weryfikacji</b>
          <p>
            {rule.verification}: brak potwierdzonego przepisu dla opisanych
            warunków.
          </p>
        </div>
      )}
      <section className="rule-answer">
        <p className="eyebrow">CO MÓWI PRZEPIS</p>
        <h2>{rule.shortAnswer}</h2>
      </section>
      {id === "jack-out" && <JackDecision />}
      {["boule-out", "lines", "jack-dead"].includes(id ?? "") && (
        <BoundaryDiagrams />
      )}
      {id?.startsWith("shoot-") && <ShootingDiagrams />}
      <details className="rule-explanation" open>
        <summary>Dlaczego i jakie są wyjątki?</summary>
        <p>{rule.explanation}</p>
      </details>
      <section className="rule-action">
        <p className="eyebrow">CO ROBISZ W MECZU</p>
        <p>{rule.action}</p>
      </section>
      <Source rule={rule} />
      {rule.related?.length && (
        <>
          <h2 className="rules-section-title">Sprawdź też</h2>
          <div className="rule-list">
            {rule.related
              .map((r) => findRule(r))
              .filter((r): r is Rule => !!r)
              .map((r) => (
                <RuleLink key={r.id} rule={r} />
              ))}
          </div>
        </>
      )}
      <Link className="secondary" to={`/rules/category/${rule.category}`}>
        Wszystkie zasady:{" "}
        {categories.find((c) => c.id === rule.category)?.title}
      </Link>
    </article>
  );
}
export function QuickHelp() {
  return (
    <div className="rules-page">
      <Back />
      <div className="page-heading">
        <p className="eyebrow">SZYBKA POMOC</p>
        <h1>Co się dzieje, gdy…?</h1>
        <p className="muted">
          Wybierz sytuację. Zobacz przepis i następny krok.
        </p>
      </div>
      <div className="quick-help-grid">
        {quickHelp.map((item, i) => (
          <Link key={item.ruleId} to={`/rules/rule/${item.ruleId}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <b>{item.situation}</b>
            <ArrowRight size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
}
export function RulesQuiz() {
  const { state, save, busy } = useApp();
  const [feedback, setFeedback] = useState("");
  const progress = state.rulesQuiz;
  const compatible =
    progress?.version === contentVersion &&
    progress.ids.every((id) => questions.some((q) => q.id === id));
  const start = async (length: number) => {
    setFeedback("");
    await save({ ...state, rulesQuiz: newQuiz(length) });
  };
  if (!progress || !compatible)
    return (
      <div className="rules-page">
        <Back />
        <div className="page-heading">
          <p className="eyebrow">NAUKA PRZEZ GRĘ</p>
          <h1>Quiz z zasad</h1>
          <p className="muted">Sytuacje, które naprawdę spotkasz na boisku.</p>
        </div>
        <div className="quiz-intro">
          <Sparkles size={36} />
          <h2>Jedna decyzja na raz.</h2>
          <p>
            Po każdej odpowiedzi zobaczysz wyjaśnienie i źródło. Postęp zapisuje
            się na tym urządzeniu.
          </p>
          {progress && (
            <p>
              Treści zostały zaktualizowane. Rozpocznij nowy quiz, aby korzystać
              z aktualnych odpowiedzi.
            </p>
          )}
          <button className="primary" disabled={busy} onClick={() => start(5)}>
            Szybka runda · 5 pytań
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => start(questions.length)}
          >
            Pełny quiz · {questions.length} pytań
          </button>
        </div>
        <Trust />
      </div>
    );
  const current = questions.find(
    (q) => q.id === progress.ids[progress.currentIndex],
  );
  if (!current)
    return (
      <div className="rules-page">
        <Back />
        <div className="quiz-intro">
          <Trophy size={40} />
          <p className="eyebrow">RUNDA ZAKOŃCZONA</p>
          <h1>
            {quizScore(progress)} / {progress.ids.length}
          </h1>
          <p>Każda sytuacja to okazja, by lepiej poznać grę.</p>
          <button className="primary" disabled={busy} onClick={() => start(5)}>
            Nowa szybka runda
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => start(questions.length)}
          >
            Pełny quiz · {questions.length} pytań
          </button>
        </div>
        <h2 className="rules-section-title">Twoje odpowiedzi</h2>
        {progress.ids.map((id) => {
          const q = questions.find((q) => q.id === id)!;
          return (
            <div className="quiz-review" key={id}>
              <b>
                {progress.answers[id] === q.correct ? "✓" : "✕"} {q.situation}
              </b>
              <p>Prawidłowo: {q.options[q.correct]}</p>
              <Link to={`/rules/rule/${q.ruleId}`}>Przeczytaj zasadę</Link>
            </div>
          );
        })}
      </div>
    );
  const selected = progress.answers[current.id];
  const answered = selected !== undefined;
  const rule = findRule(current.ruleId)!;
  const answer = async (index: number) => {
    if (answered || busy) return;
    const ok = await save({
      ...state,
      rulesQuiz: {
        ...progress,
        answers: { ...progress.answers, [current.id]: index },
      },
    });
    if (ok)
      setFeedback(
        index === current.correct
          ? "Dobra decyzja!"
          : "Zobacz, jak rozstrzyga to przepis.",
      );
  };
  const next = async () => {
    if (
      await save({
        ...state,
        rulesQuiz: { ...progress, currentIndex: progress.currentIndex + 1 },
      })
    )
      setFeedback("");
  };
  return (
    <div className="rules-page">
      <Back />
      <div className="quiz-heading">
        <p className="eyebrow">QUIZ Z ZASAD</p>
        <span>
          {progress.currentIndex + 1} / {progress.ids.length}
        </span>
      </div>
      <progress
        aria-label="Postęp quizu"
        max={progress.ids.length}
        value={progress.currentIndex + (answered ? 1 : 0)}
      />
      <h1 className="quiz-question">{current.situation}</h1>
      <div className="quiz-options">
        {current.options.map((option, i) => (
          <button
            key={option}
            disabled={answered || busy}
            className={
              answered
                ? i === current.correct
                  ? "correct"
                  : i === selected
                    ? "incorrect"
                    : ""
                : ""
            }
            onClick={() => answer(i)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            <b>{option}</b>
            {answered && i === current.correct && <Check size={22} />}
          </button>
        ))}
      </div>
      {answered && (
        <div className="quiz-feedback" role="status">
          <h2>
            {feedback ||
              (selected === current.correct
                ? "Dobra decyzja!"
                : "Zobacz, jak rozstrzyga to przepis.")}
          </h2>
          <p>
            <b>Prawidłowo: {current.options[current.correct]}</b>
          </p>
          <p>{current.explanation}</p>
          <details>
            <summary>Wyjątki i szczegóły</summary>
            <p>{rule.explanation}</p>
          </details>
          <Source rule={rule} />
          <button className="primary" disabled={busy} onClick={next}>
            {progress.currentIndex === progress.ids.length - 1
              ? "Zobacz wynik"
              : "Następne pytanie"}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
      <p className="muted quiz-save-note">
        Możesz wyjść i wrócić. Runda zapisuje się po odpowiedzi.
      </p>
    </div>
  );
}
