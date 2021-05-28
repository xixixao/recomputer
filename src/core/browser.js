const persistentParams = { autosave: true };

export function currentUri(addedParams) {
  const url = new URL(document.location);
  const oldParams = url.searchParams;
  const newParams = new URLSearchParams();
  for (let [key, value] of Object.entries(addedParams)) {
    newParams.set(key, value);
  }
  for (let [key, value] of oldParams.entries()) {
    if (key in persistentParams) {
      newParams.set(key, value);
    }
  }
  url.search = newParams.toString();
  return url;
}

export const linkClick = "click";
