export class LocalStorage {
  static main() {
    return new LocalStorage("Key1");
  }

  constructor(key) {
    this.key = key;
    this.hasChanges = false;
    window.addEventListener("beforeunload", () => {
      if (this.view != null) {
        write(this);
      }
    });
  }

  save(update) {
    this.hasChanges = this.hasChanges || update.docChanged;
    this.view = update.view;
    if (this.hasChanges) {
      writeDebounced(this);
    }
  }

  load() {
    return window.localStorage.getItem(this.key);
  }
}

const writeDebounced = debounce(write, 1000);

function write(instance) {
  window.localStorage.setItem(
    instance.key,
    instance.view.state.doc.sliceString(0)
  );
  instance.hasChanges = false;
}

function debounce(debounced, delay) {
  let timeout = null;
  let shouldRun = false;
  return function () {
    let context = this;
    let args = arguments;
    const later = function () {
      timeout = null;
      if (shouldRun) {
        shouldRun = false;
        debounced.apply(context, args);
      }
    };
    const callNow = timeout == null;
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
    if (callNow) {
      debounced.apply(context, args);
    } else {
      shouldRun = true;
    }
  };
}
