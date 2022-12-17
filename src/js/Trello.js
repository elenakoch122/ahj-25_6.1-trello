/* eslint-disable class-methods-use-this */
import Card from './Card';

export default class Trello {
  constructor(element) {
    this.element = element;

    this.onClickCardDelete = this.onClickCardDelete.bind(this);
    this.onClickCardDrag = this.onClickCardDrag.bind(this);
    this.onClickFooter = this.onClickFooter.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  }

  static get markupSaveBtn() {
    return `
    <textarea class="column__add-textarea" cols="30" rows="4" placeholder="Напишите задачу..."></textarea>
    <button class="column__save">Добавить</button>
    <span class="close column__add-close"></span>
    `;
  }

  static get markupAddBtn() {
    return `
    <button class="column__add">Добавить задачу</button>
    `;
  }

  init() {
    const blocksWithCards = this.element.querySelectorAll('.column__cards');
    const footers = this.element.querySelectorAll('.column__footer');

    blocksWithCards.forEach((block) => {
      block.addEventListener('mousedown', this.onClickCardDrag);
      block.addEventListener('click', this.onClickCardDelete);
    });
    footers.forEach((f) => f.addEventListener('click', this.onClickFooter));
  }

  onClickCardDrag(e) {
    if (!e.target.classList.contains('column__card')) return;

    e.preventDefault();
    this.actualEl = e.target;
    this.actualEl.classList.add('dragged');

    this.shiftY = e.clientY - this.actualEl.offsetTop;
    this.shiftX = e.clientX - this.actualEl.offsetLeft;

    document.documentElement.addEventListener('mouseup', this.onMouseUp);
    document.documentElement.addEventListener('mouseover', this.onMouseOver);
  }

  onClickCardDelete(e) {
    if (!e.target.classList.contains('column__card-close')) return;
    this.deleteCard(e.target);
  }

  onClickFooter(e) {
    if (e.target.classList.contains('column__add') || e.target.classList.contains('column__add-close')) {
      this.changeFooter(e.target);
    }

    if (e.target.classList.contains('column__save')) this.onClickSave(e.target);
  }

  onMouseUp(e) {
    console.log(e.target);
    console.log(e.relatedTarget);
    const mouseUpEl = e.target;
    const parentMouseUpEl = mouseUpEl.parentElement;

    if (parentMouseUpEl.classList.contains('column__cards')) {
      parentMouseUpEl.insertBefore(this.actualEl, mouseUpEl);
    }

    this.actualEl.removeAttribute('style');

    this.actualEl.classList.remove('dragged');
    this.actualEl = null;

    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mouseover', this.onMouseOver);
  }

  onMouseOver(e) {
    console.log(e.target);
    // e.relatedTarget.classList.remove('pushed');
    this.actualEl.style.top = `${e.clientY - this.shiftY}px`;
    this.actualEl.style.left = `${e.clientX - this.shiftX}px`;
    // console.log(this.actualEl);
    // e.target.classList.add('pushed');
  }

  deleteCard(target) {
    const card = target.closest('.column__card');
    card.remove();
  }

  changeFooter(target) {
    const footer = target.closest('.column__footer');

    if (footer.children.length === 1) {
      target.remove();
      footer.insertAdjacentHTML('beforeend', Trello.markupSaveBtn);
      return;
    }

    if (footer.children.length > 1) {
      [...footer.children].forEach((child) => child.remove());
      footer.insertAdjacentHTML('beforeend', Trello.markupAddBtn);
    }
  }

  onClickSave(target) {
    const column = target.closest('.column');
    const columnCards = column.querySelector('.column__cards');
    const msg = column.querySelector('.column__add-textarea').value;
    const card = new Card(msg);

    columnCards.append(card.element);

    this.changeFooter(target);
  }

  addCard() {

  }
}
