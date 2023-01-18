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
    this.shiftX -= this.elem.offsetLeft;
    this.shiftY -= this.elem.offsetTop - this.elem.offsetHeight - 7;
    // console.dir(this.elem);
    this.elem.style.left = '0px';
    this.elem.style.top = `${this.elem.offsetTop - this.elem.offsetHeight - 7}px`;
    // console.log(this.elem);
  }

  move(x, y) {
    this.elem.style.left = `${x - this.shiftX}px`;
    this.elem.style.top = `${y - this.shiftY}px`;
    // console.dir(this.elem);
  }

  clear() {
    this.elem.removeAttribute('style');
    this.elem.classList.remove('dragged');
  }
}
