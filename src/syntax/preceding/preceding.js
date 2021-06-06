export const LAST_RESULT_SYMBOL = "_";

export function saveLastResult(state, value) {
  state.values.set(LAST_RESULT_SYMBOL, value);
}
