import { Link } from "react-router-dom";

export function RoutineGuide({ expanded }: { expanded: boolean }) {
  return (
    <section
      id="routine-guide"
      className="card"
      aria-label="Wprowadzenie do rutyny"
    >
      <h2>Zanim rzucisz: poznaj rutynę</h2>
      <p>
        To krótki sposób przygotowania każdej kuli i powrotu do gry po rzucie.
        Nie musisz wcześniej zaliczać lekcji.
      </p>
      <details open={expanded}>
        <summary>Plan → Oddech → Wykonanie → Reset</summary>
        <ol>
          <li>
            <b>Plan:</b> wybierz zagranie i konkretny cel, np. miejsce
            lądowania.
          </li>
          <li>
            <b>Oddech:</b> zrób spokojny wydech, bez zatrzymywania powietrza.
          </li>
          <li>
            <b>Wykonanie:</b> rzuć swoim wytrenowanym ruchem.
          </li>
          <li>
            <b>Reset:</b> nazwij jeden fakt, np. „za krótko”, i przygotuj
            następną kulę. Zrób to także po trafieniu.
          </li>
        </ol>
        <p>
          W tej serii spróbuj powtarzać te cztery kroki. Po treningu zaznacz
          „Używałem rutyny”, jeśli świadomie z niej korzystałeś. To Twoja
          samoocena, niezależna od punktów; możesz zostawić ją bez odpowiedzi.
        </p>
        <Link className="text-link" to="/lessons/routine">
          Poznaj lekcję „Rutyna przed rzutem” →
        </Link>
      </details>
    </section>
  );
}
