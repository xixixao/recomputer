import { combineConfig, EditorSelection, Facet } from "@codemirror/state";
import {
  BlockType,
  Direction,
  drawSelection,
  ViewPlugin,
} from "@codemirror/view";

const [_, _2, hideNativeSelection] = drawSelection();

const selectionConfig = Facet.define({
  combine(configs) {
    return combineConfig(
      configs,
      {
        cursorBlinkRate: 1200,
        drawRangeCursor: true,
      },
      {
        cursorBlinkRate: (a, b) => Math.min(a, b),
        drawRangeCursor: (a, b) => a || b,
      }
    );
  },
});

export function drawBetterSelection() {
  return [selectionConfig.of({}), drawSelectionPlugin, hideNativeSelection];
}

const nav =
  typeof navigator != "undefined"
    ? navigator
    : { userAgent: "", vendor: "", platform: "" };

const safari = /Apple Computer/.test(nav.vendor);
const browser = {
  ios: safari && (/Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2),
};
const CanHidePrimary = !browser.ios;
const drawSelectionPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.view = view;
      this.rangePieces = [];
      this.cursors = [];
      this.measureReq = {
        read: this.readPos.bind(this),
        write: this.drawSel.bind(this),
      };
      this.selectionLayer = view.scrollDOM.appendChild(
        document.createElement("div")
      );
      this.selectionLayer.className = "cm-selectionLayer";
      this.selectionLayer.setAttribute("aria-hidden", "true");
      this.cursorLayer = view.scrollDOM.appendChild(
        document.createElement("div")
      );
      this.cursorLayer.className = "cm-cursorLayer";
      this.cursorLayer.setAttribute("aria-hidden", "true");
      view.requestMeasure(this.measureReq);
      this.setBlinkRate();
    }

    setBlinkRate() {
      this.cursorLayer.style.animationDuration =
        this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }

    update(update) {
      let confChanged =
        update.startState.facet(selectionConfig) !=
        update.state.facet(selectionConfig);
      if (
        confChanged ||
        update.selectionSet ||
        update.geometryChanged ||
        update.viewportChanged
      )
        this.view.requestMeasure(this.measureReq);
      if (update.transactions.some((tr) => tr.scrollIntoView))
        this.cursorLayer.style.animationName =
          this.cursorLayer.style.animationName == "cm-blink"
            ? "cm-blink2"
            : "cm-blink";
      if (confChanged) this.setBlinkRate();
    }

    readPos() {
      let { state } = this.view,
        conf = state.facet(selectionConfig);
      let rangePieces = state.selection.ranges
        .map((r) => (r.empty ? [] : measureRange(this.view, r)))
        .reduce((a, b) => a.concat(b));
      let cursors = [];
      for (let r of state.selection.ranges) {
        let prim = r == state.selection.main;
        if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
          let piece = measureCursor(this.view, r, prim);
          if (piece) cursors.push(piece);
        }
      }
      return { rangePieces, cursors };
    }

    drawSel({ rangePieces, cursors }) {
      if (
        rangePieces.length != this.rangePieces.length ||
        rangePieces.some((p, i) => !p.eq(this.rangePieces[i]))
      ) {
        this.selectionLayer.textContent = "";
        for (let p of rangePieces) this.selectionLayer.appendChild(p.draw());
        this.rangePieces = rangePieces;
      }
      if (
        cursors.length != this.cursors.length ||
        cursors.some((c, i) => !c.eq(this.cursors[i]))
      ) {
        let oldCursors = this.cursorLayer.children;
        if (oldCursors.length !== cursors.length) {
          this.cursorLayer.textContent = "";
          for (const c of cursors) this.cursorLayer.appendChild(c.draw());
        } else {
          cursors.forEach((c, idx) => c.adjust(oldCursors[idx]));
        }
        this.cursors = cursors;
      }
    }

    destroy() {
      this.selectionLayer.remove();
      this.cursorLayer.remove();
    }
  }
);

class Piece {
  constructor(left, top, width, height, className) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.className = className;
  }
  draw() {
    let elt = document.createElement("div");
    elt.className = this.className;
    this.adjust(elt);
    return elt;
  }
  adjust(elt) {
    elt.style.left = this.left + "px";
    elt.style.top = this.top + "px";
    if (this.width >= 0) elt.style.width = this.width + "px";
    elt.style.height = this.height + "px";
  }
  eq(p) {
    return (
      this.left == p.left &&
      this.top == p.top &&
      this.width == p.width &&
      this.height == p.height &&
      this.className == p.className
    );
  }
}

function getBase(view) {
  let rect = view.scrollDOM.getBoundingClientRect();
  let left =
    view.textDirection == Direction.LTR
      ? rect.left
      : rect.right - view.scrollDOM.clientWidth;
  return {
    left: left - view.scrollDOM.scrollLeft,
    top: rect.top - view.scrollDOM.scrollTop,
  };
}
function wrappedLine(view, pos, inside) {
  let range = EditorSelection.cursor(pos);
  return {
    from: Math.max(
      inside.from,
      view.moveToLineBoundary(range, false, true).from
    ),
    to: Math.min(inside.to, view.moveToLineBoundary(range, true, true).from),
  };
}
function nextLineBoundary(view, pos) {
  return view.moveToLineBoundary(EditorSelection.cursor(pos), true, true).from;
}
function blockAt(view, pos) {
  let line = view.lineBlockAt(pos);
  if (Array.isArray(line.type))
    for (let l of line.type) {
      if (
        l.to > pos ||
        (l.to == pos && (l.to == line.to || l.type == BlockType.Text))
      )
        return l;
    }
  return line;
}
function measureRange(view, range) {
  if (range.to <= view.viewport.from || range.from >= view.viewport.to)
    return [];
  let from = Math.max(range.from, view.viewport.from),
    to = Math.min(range.to, view.viewport.to);
  let ltr = view.textDirection == Direction.LTR;
  let content = view.contentDOM,
    contentRect = content.getBoundingClientRect(),
    base = getBase(view);
  let lineStyle = window.getComputedStyle(content.firstChild);
  let leftSide =
    contentRect.left +
    parseInt(lineStyle.paddingLeft) +
    Math.min(0, parseInt(lineStyle.textIndent));
  let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
  let startBlock = blockAt(view, from),
    endBlock = blockAt(view, to);
  let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
  let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
  if (view.lineWrapping) {
    if (visualStart) visualStart = wrappedLine(view, from, visualStart);
    if (visualEnd) visualEnd = wrappedLine(view, to, visualEnd);
  }
  if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
    return pieces(drawForLine(range.from, range.to, visualStart));
  } else {
    let top = visualStart
      ? drawForLine(range.from, null, visualStart)
      : drawForWidget(startBlock, false);
    let bottom = visualEnd
      ? drawForLine(null, range.to, visualEnd)
      : drawForWidget(endBlock, true);
    let between = [];
    if ((visualStart || startBlock).to < (visualEnd || endBlock).from - 1) {
      // RECOMPUTER CHANGE START
      // between.push(piece(leftSide, top.bottom, rightSide, bottom.top));
      while (visualStart.to < visualEnd.from - 1) {
        const visualLine = {
          from: visualStart.to + 1,
          to: nextLineBoundary(view, visualStart.to + 1),
        };
        between.push(pieces(drawForLine(null, null, visualLine, true)));
        visualStart = visualLine;
      }
      between = between.flat();
      // RECOMPUTER CHANGE END
    } else if (
      top.bottom < bottom.top &&
      view.elementAtHeight((top.bottom + bottom.top) / 2).type == BlockType.Text
    )
      top.bottom = bottom.top = (top.bottom + bottom.top) / 2;
    return pieces(top).concat(between).concat(pieces(bottom));
  }
  function piece(left, top, right, bottom) {
    return new Piece(
      left - base.left,
      top - base.top - 0.01,
      right - left,
      bottom - top + 0.01,
      "cm-selectionBackground"
    );
  }
  function pieces({ top, bottom, horizontal }) {
    let pieces = [];
    for (let i = 0; i < horizontal.length; i += 2)
      pieces.push(piece(horizontal[i], top, horizontal[i + 1], bottom));
    return pieces;
  }
  // Gets passed from/to in line-local positions
  function drawForLine(from, to, line, isMiddle) {
    let top = 1e9,
      bottom = -1e9,
      horizontal = [];
    function addSpan(from, fromOpen, to, toOpen, dir) {
      // Passing 2/-2 is a kludge to force the view to return
      // coordinates on the proper side of block widgets, since
      // normalizing the side there, though appropriate for most
      // coordsAtPos queries, would break selection drawing.
      let fromCoords = view.coordsAtPos(from, from == line.to ? -2 : 2);
      let toCoords = view.coordsAtPos(to, to == line.from ? 2 : -2);
      top =
        Math.min(fromCoords.top, toCoords.top, top) -
        (fromOpen || isMiddle ? 5 : 0);
      bottom =
        Math.max(fromCoords.bottom, toCoords.bottom, bottom) +
        (toOpen || isMiddle ? 5 : 0);
      if (dir == Direction.LTR)
        horizontal.push(
          ltr && fromOpen ? leftSide : fromCoords.left,
          // RECOMPUTER CHANGE START
          // ltr && toOpen ? rightSide : toCoords.right
          // TODO: How to determine "one character" size?
          toCoords.right + (ltr && toOpen ? 5 : 0)
          // RECOMPUTER CHANGE END
        );
      else
        horizontal.push(
          !ltr && toOpen ? leftSide : toCoords.left,
          !ltr && fromOpen ? rightSide : fromCoords.right
        );
    }
    let start = from !== null && from !== void 0 ? from : line.from,
      end = to !== null && to !== void 0 ? to : line.to;
    // Split the range by visible range and document line
    for (let r of view.visibleRanges)
      if (r.to > start && r.from < end) {
        for (
          let pos = Math.max(r.from, start), endPos = Math.min(r.to, end);
          ;

        ) {
          let docLine = view.state.doc.lineAt(pos);
          for (let span of view.bidiSpans(docLine)) {
            let spanFrom = span.from + docLine.from,
              spanTo = span.to + docLine.from;
            if (spanFrom >= endPos) break;
            if (spanTo > pos)
              addSpan(
                Math.max(spanFrom, pos),
                from == null && spanFrom <= start,
                Math.min(spanTo, endPos),
                to == null && spanTo >= end,
                span.dir
              );
          }
          pos = docLine.to + 1;
          if (pos >= endPos) break;
        }
      }
    if (horizontal.length == 0)
      addSpan(start, from == null, end, to == null, view.textDirection);
    return { top, bottom, horizontal };
  }
  function drawForWidget(block, top) {
    let y = contentRect.top + (top ? block.top : block.bottom);
    return { top: y, bottom: y, horizontal: [] };
  }
}
function measureCursor(view, cursor, primary) {
  let pos = view.coordsAtPos(cursor.head, cursor.assoc || 1);
  if (!pos) return null;
  let base = getBase(view);
  return new Piece(
    pos.left - base.left,
    pos.top - base.top,
    -1,
    pos.bottom - pos.top,
    primary ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary"
  );
}
