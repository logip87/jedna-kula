import { useState, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";

export function Feedback() {
  const [kind, setKind] = useState("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const locked = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    setError("");
    if (message.trim().length < 10) {
      setError("Opisz zgłoszenie w co najmniej 10 znakach.");
      return;
    }
    if (!navigator.onLine) {
      setError(
        "Do wysłania zgłoszenia potrzebujesz internetu. Treść pozostaje w formularzu.",
      );
      return;
    }
    const website = String(
      new FormData(event.currentTarget).get("website") ?? "",
    );
    locked.current = true;
    setBusy(true);
    try {
      const tokenResponse = await fetch("/api/feedback.php", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!tokenResponse.ok)
        throw new Error(
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie za chwilę.",
        );
      const token = await tokenResponse.json();
      if (typeof token.csrf !== "string")
        throw new Error(
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie za chwilę.",
        );
      const response = await fetch("/api/feedback.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          email: email.trim(),
          website,
          csrf: token.csrf,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true)
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        );
      setSent(true);
      setMessage("");
      setEmail("");
    } catch (failure) {
      setError(
        failure instanceof TypeError || failure instanceof SyntaxError
          ? "Nie udało się połączyć z serwerem. Treść pozostaje w formularzu — spróbuj ponownie."
          : failure instanceof Error
            ? failure.message
            : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="coach-page feedback-page">
      <Link className="back" to="/more">
        ← Więcej
      </Link>
      <div className="page-heading">
        <p className="eyebrow">POMÓŻ ULEPSZYĆ JEDNĄ KULĘ</p>
        <h1>Zgłoś pomysł / problem</h1>
        <p className="muted">
          Masz pomysł albo coś nie działa? Napisz, co możemy poprawić.
        </p>
      </div>
      {sent ? (
        <section className="card" role="status">
          <h2>Dziękujemy za zgłoszenie!</h2>
          <p>Serwer przyjął wiadomość do wysyłki na p.logasz@gmail.com.</p>
          <Link className="button" to="/">
            Wróć do Dzisiaj
          </Link>
          <button className="secondary" onClick={() => setSent(false)}>
            Dodaj kolejne zgłoszenie
          </button>
        </section>
      ) : (
        <form className="card config" onSubmit={submit} aria-busy={busy}>
          <label>
            Rodzaj zgłoszenia
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              disabled={busy}
            >
              <option value="idea">Pomysł</option>
              <option value="problem">Problem</option>
            </select>
          </label>
          <label htmlFor="feedback-message">Twoje zgłoszenie</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            required
            minLength={10}
            maxLength={5000}
            disabled={busy}
            placeholder="Opisz pomysł. Jeśli coś nie działa, napisz, co próbujesz zrobić i co się dzieje."
            aria-describedby="feedback-counter"
          />
          <p id="feedback-counter" className="muted small">
            {message.length} / 5000 znaków · minimum 10
          </p>
          <label>
            Twój e-mail (opcjonalnie)
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              disabled={busy}
              placeholder="Jeśli chcesz otrzymać odpowiedź"
            />
          </label>
          <div className="feedback-trap" aria-hidden="true">
            <label>
              Strona internetowa
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="muted small">
            Wyślemy treść zgłoszenia i podany e-mail na{" "}
            <b>p.logasz@gmail.com</b>. Nie dołączamy profilu ani wyników
            treningów.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" type="submit" disabled={busy}>
            <Send size={20} />
            {busy ? "Wysyłanie…" : "Wyślij"}
          </button>
        </form>
      )}
    </div>
  );
}
