// Works on code units not code points because of Lezer
export class Dictionary {
  constructor(terms) {
    this.root = dictionaryNode();
    (terms ?? []).forEach((term) => {
      this.add(term, 0);
    });
  }

  add(
    term,
    // Assumed largest so far
    from
  ) {
    let node = this.root;
    for (let i = 0; i < term.length; i++) {
      const ch = term[i];
      let next = node.to.get(ch);
      if (next == null) {
        next = dictionaryNode();
        node.to.set(ch, next);
        node.from = node.from ?? from;
      }
      node = next;
    }
    node.term = node.term ?? from;
  }

  // Returns longest term in the dictionary
  search(at, getCodeUnit) {
    let node = this.root;
    let index = 0;
    let acc = "";
    let result = null;
    while (node != null) {
      if (node.term != null && node.term <= at) {
        result = acc;
      }
      const ch = getCodeUnit(index);
      if (ch != null && node.from != null && node.from <= at) {
        acc += ch;
        node = node.to.get(ch);
      } else {
        node = null;
      }
      index++;
    }
    return result;
  }
}

function dictionaryNode() {
  return { to: new Map() };
}
