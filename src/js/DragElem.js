import GhostElem from './GhostElem';

export default class DragElem {
  constructor(elem, x, y) {
    this.elem = elem;
    this.shiftX = x;
    this.shiftY = y;
    this.ghost = new GhostElem(elem);
    this.card = null;
    this.index = null;
  }

  bindToDOM() {
    this.elem.parentElement.insertBefore(this.ghost.elem, this.elem);
    this.elem.classList.add('dragged');
    this.elem.style.left = `${0}px`;
    this.elem.style.top = `${0}px`;
  }

  move(x, y) {
    this.elem.style.left = `${x - this.shiftX}px`;
    this.elem.style.top = `${y - this.shiftY}px`;
  }
}
