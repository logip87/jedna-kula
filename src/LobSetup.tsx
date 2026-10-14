export function LobSetup({
  distance,
  obstacle = false,
  isTest = false,
}: {
  distance: number;
  obstacle?: boolean;
  isTest?: boolean;
}) {
  const metres = (value: number) => value.toLocaleString("pl-PL");
  return (
    <section className="notice" aria-label="Ustawienie do loba">
      <h3>Gdzie ustawić świnkę i pole lądowania?</h3>
      <ol>
        <li>
          Ustaw świnkę{" "}
          <b>
            {metres(distance)} m od przedniej krawędzi kółka, z którego rzucasz
          </b>
          . To odległość podana w treningu.
        </li>
        <li>
          Na początek zaznacz na ziemi koło o <b>średnicy 50 cm</b> (25 cm od
          środka do brzegu). Środek koła umieść na{" "}
          <b>{metres(distance - 1)} m</b> od tej samej krawędzi, czyli{" "}
          <b>1 m przed świnką</b>, na linii rzutu. Możesz obrysować je patykiem
          lub kredą.
        </li>
        {obstacle && (
          <li>
            Połóż płaski znacznik na {metres(distance - 1.5)} m, czyli 50 cm
            przed środkiem pola lądowania. Rzuć nad nim do koła.
          </li>
        )}
        <li>
          Celuj w to koło. Sprawdź, gdzie kula{" "}
          <b>pierwszy raz dotknęła ziemi</b>. To miejsce oceniasz jako „w kole”
          lub „poza kołem”. Następnie osobno zmierz odległość zatrzymanej kuli
          od świnki.
        </li>
      </ol>
      <p className="muted small">
        Metr przed świnką to propozycja na początek. Jeśli kula toczy się za
        daleko, przesuń pole bliżej siebie; jeśli zatrzymuje się przed świnką,
        przesuń je bliżej świnki. Dopasuj ustawienie w rzutach próbnych
        {isTest
          ? ", a podczas testu zachowaj ten sam odstęp od świnki."
          : "."}{" "}
        Gdy zmienia się dystans, przestaw świnkę i pole lądowania.
      </p>
    </section>
  );
}
