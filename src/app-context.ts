import { createContext, useContext } from "react";
import { emptyState, type State } from "./domain";
export const Context = createContext<{
  state: State;
  save: (s: State) => Promise<boolean>;
  restore: (s: State) => Promise<boolean>;
  busy: boolean;
}>({
  state: emptyState,
  save: async () => false,
  restore: async () => false,
  busy: false,
});
export const useApp = () => useContext(Context);
