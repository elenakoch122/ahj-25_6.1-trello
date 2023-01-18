/* eslint-disable class-methods-use-this */
export default class GhostElem {
  constructor(elem) {
    this.elem = this.createGhost(elem);
  }

  createGhost(elem) {
    const ghost = document.createElement('div');
    ghost.classList.add('ghost');
    ghost.style.width = `${elem.offsetWidth}px`;
    ghost.style.height = `${elem.offsetHeight}px`;
    return ghost;
  }

  delete() {
    this.elem.remove();
  }
}
