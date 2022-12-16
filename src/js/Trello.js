import Card from "./Card";

export default class Trello {
  constructor(element) {
    this.element = element;

    this.onClickCard = this.onClickCard.bind(this);
    this.onClickFooter = this.onClickFooter.bind(this);
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

    // cards.forEach((c) => c.addEventListener('click', this.onClickCard));
    blocksWithCards.forEach((block) => {
      block.addEventListener('mousedown', this.moveCard);
      block.addEventListener('click', this.onClickCard);
    });
    footers.forEach((f) => f.addEventListener('click', this.onClickFooter));
  }

  onClickCard(e) {
    if (e.target.classList.contains('column__card-close')) {
      this.deleteCard(e.target);
      return;
    }

    // this.moveCard(e.target);
  }

  onClickFooter(e) {
    if (e.target.classList.contains('column__add') || e.target.classList.contains('column__add-close')) {
      this.changeFooter(e.target);
    }

    if (e.target.classList.contains('column__save')) this.onClickSave(e.target);
  }

  onMouseUp(e) {
    const mouseUpEl = e.target;
    const parentMouseUpEl = mouseUpEl.parentElement;

    parentMouseUpEl.insertBefore(this.actualEl, mouseUpEl);

    this.actualEl.classList.remove('dragged');
    this.actualEl = null;

    this.parentActualEl.removeEventListener('mouseup', this.onMouseUp);
    this.parentActualEl.removeEventListener('mouseover', this.onMouseOver);
  }

  onMouseOver(e) {
    this.actualEl.style.top = `${e.clientY}px`;
    this.actualEl.style.left = `${e.clientX}px`;
  }

  moveCard(e) {
    e.preventDefault();
    this.parentActualEl = e.target.closest('.column__cards');
    this.actualEl = e.target;
    this.actualEl.classList.add('dragged');

    this.parentActualEl.addEventListener('mouseup', this.onMouseUp);
    this.parentActualEl.addEventListener('mouseover', this.onMouseOver);
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
