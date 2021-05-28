const KEY = "Key1";

let hasChanges = false;

export const saveToLocalStorage = (update) => {
  hasChanges = hasChanges || update.docChanged;
  writeThrough(update);
};

const writeThrough = debounce((update) => {
  if (hasChanges) {
    localStorage.setItem(KEY, update.view.state.doc.sliceString(0));
    hasChanges = false;
  }
}, 1000);

export const loadFromLocalStorage = () => {
  return localStorage.getItem(KEY);
};

function debounce(debounced, delay) {
  let timeout = null;
  return function () {
    let context = this;
    let args = arguments;
    const later = function () {
      timeout = null;
      debounced.apply(context, args);
    };
    const callNow = timeout == null;
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
    if (callNow) {
      debounced.apply(context, args);
    }
  };
}
