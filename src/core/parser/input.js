import { Text } from "@codemirror/state";

// Simulates the Input given by Codemirror, but doesn't keep memory
// as low.
export function stringToChunkedInput(string) {
  return new DocInput(Text.of(string.split("\n")));
}

class DocInput {
  constructor(doc, length = doc.length) {
    this.doc = doc;
    this.length = length;
    this.cursorPos = 0;
    this.string = "";
    this.cursor = doc.iter();
  }
  syncTo(pos) {
    this.string = this.cursor.next(pos - this.cursorPos).value;
    this.cursorPos = pos + this.string.length;
    return this.cursorPos - this.string.length;
  }
  chunk(pos) {
    this.syncTo(pos);
    return this.string;
  }
  get lineChunks() {
    return true;
  }
  read(from, to) {
    let stringStart = this.cursorPos - this.string.length;
    if (from < stringStart || to >= this.cursorPos)
      return this.doc.sliceString(from, to);
    else return this.string.slice(from - stringStart, to - stringStart);
  }
}
