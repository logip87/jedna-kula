import { Component, type ReactNode } from "react";

// Keep navigation and stored training available when a deferred screen cannot
// load (for example, connection lost before the first offline cache completed).
export class ScreenBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section className="card" role="alert">
          <h1>Nie udało się otworzyć ekranu</h1>
          <p>
            Sprawdź połączenie i spróbuj ponownie. Zapisane treningi pozostają
            na urządzeniu.
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </button>
        </section>
      );
    return this.props.children;
  }
}
