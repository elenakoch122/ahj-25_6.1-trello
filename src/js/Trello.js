/* eslint-disable class-methods-use-this */
import Card from './Card';
import State from './State';

export default class Trello {
  constructor(stateService) {
    this.element = document.querySelector('.board');
    this.stateService = stateService;
    this.state = new State();
    this.count = 1;

    this.onClickCardDelete = this.onClickCardDelete.bind(this);
    this.onClickFooter = this.onClickFooter.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
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
      block.addEventListener('mousedown', this.onMouseDown);
      block.addEventListener('click', this.onClickCardDelete);
    });
    footers.forEach((f) => f.addEventListener('click', this.onClickFooter));

    window.addEventListener('beforeunload', () => {
      this.stateService.save(this.state);
    });

    document.addEventListener('DOMContentLoaded', () => {
      const { cards } = this.stateService.load();

      if (cards.length > 0) {
        this.drawCards(cards);
      }
      console.log(this.state.cards);
    });
  }

  onMouseDown(e) {
    if (!e.target.classList.contains('column__card')) return;

    e.preventDefault();
    this.actualEl = e.target;
    this.actualCard = this.state.cards.find((c) => c.id === Number(this.actualEl.getAttribute('data-id')));
    this.actualCardIdx = this.state.cards.indexOf(this.actualCard);

    this.emptyElem = e.target.cloneNode(true);
    this.emptyElem.classList.add('empty');

    this.actualEl.parentElement.insertBefore(this.emptyElem, this.actualEl);
    this.actualEl.classList.add('dragged');

    this.shiftY = e.clientY - this.actualEl.offsetTop + this.actualEl.offsetHeight + 7;
    this.shiftX = e.clientX - this.actualEl.offsetLeft;

    document.documentElement.addEventListener('mouseover', this.onMouseOver);
    document.documentElement.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseOver(e) {
    this.actualEl.style.top = `${e.clientY - this.shiftY}px`;
    this.actualEl.style.left = `${e.clientX - this.shiftX}px`;

    this.overCard = e.relatedTarget;
    this.overCardParent = this.overCard.parentElement;

    if (this.overCardParent) {
      if (this.overCardParent.classList.contains('column__cards')) {
        this.overCardParent.insertBefore(this.emptyElem, this.overCard);
      }

      if (this.overCardParent.classList.contains('column__footer')) {
        this.overCardParent.parentElement.querySelector('.column__cards').append(this.emptyElem);
      }
    }
  }

  onMouseUp() {
    if (this.overCard.tagName !== 'HTML' && this.overCard.tagName !== 'BODY') {
      if (this.overCardParent) {
        const isColumn = this.overCardParent.parentElement.classList.contains('column');
        const isBoard = this.overCardParent.parentElement.classList.contains('board');

        if (isColumn) {
          if (this.overCardParent.classList.contains('column__cards')) {
            const slidingCard = this.state.cards.find((c) => c.id === Number(this.overCard.getAttribute('data-id')));
            const slidingCardIdx = this.state.cards.indexOf(slidingCard);
            const delActualEl = this.state.cards.splice(this.actualCardIdx, 1);
            this.state.cards.splice(slidingCardIdx, 0, delActualEl[0]);
            this.overCardParent.insertBefore(this.actualEl, this.overCard);
          }

          if (this.overCardParent.classList.contains('column__footer')) {
            const columnCards = this.overCardParent.parentElement.querySelector('.column__cards');
            const slidingCard = this.state.cards.find((c) => c.id === Number(columnCards.children[columnCards.children.length - 2].getAttribute('data-id')));
            const slidingCardIdx = this.state.cards.indexOf(slidingCard);
            const delActualEl = this.state.cards.splice(this.actualCardIdx, 1);
            this.state.cards.splice(slidingCardIdx + 1, 0, delActualEl[0]);
            columnCards.append(this.actualEl);
          }
          this.actualCard.column = this.overCardParent.parentElement.className;
        }

        if (isBoard) {
          if (this.overCard.classList.contains('column__footer')) {
            const columnCards = this.overCardParent.querySelector('.column__cards');
            const slidingCard = this.state.cards.find((c) => c.id === Number(columnCards.children[columnCards.children.length - 2].getAttribute('data-id')));
            const slidingCardIdx = this.state.cards.indexOf(slidingCard);
            const delActualEl = this.state.cards.splice(this.actualCardIdx, 1);
            this.state.cards.splice(slidingCardIdx + 1, 0, delActualEl[0]);
            columnCards.append(this.actualEl);
          }
        }
      }
    }
    console.log(this.state.cards);

    this.emptyElem.remove();

    this.actualEl.removeAttribute('style');
    this.actualEl.classList.remove('dragged');

    this.clearElements();

    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mouseover', this.onMouseOver);
  }

  clearElements() {
    this.actualEl = null;
    this.actualCard = null;
    this.actualCardIdx = null;
    this.emptyElem = null;
    this.overCard = null;
    this.overCardParent = null;
  }

  onClickCardDelete(e) {
    if (!e.target.classList.contains('column__card-close')) return;
    this.deleteCard(e.target);
  }

  deleteCard(target) {
    const card = target.closest('.column__card');
    const cardID = Number(card.getAttribute('data-id'));
    this.state.cards = this.state.cards.filter((c) => c.id !== cardID);
    card.remove();
    console.log(this.state.cards);
  }

  onClickFooter(e) {
    if (e.target.classList.contains('column__add') || e.target.classList.contains('column__add-close')) {
      this.changeFooter(e.target);
    }

    if (e.target.classList.contains('column__save')) this.onClickSave(e.target);
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
    const card = new Card(msg, column.className, this.count);

    this.state.cards.push(card);
    console.log(this.state.cards);

    columnCards.append(card.create());

    this.changeFooter(target);

    this.count += 1;
  }

  drawCards(cards) {
    cards.forEach((c) => {
      const card = new Card(c.text, c.column, this.count);
      this.state.cards.push(card);
      const columns = document.querySelectorAll('.column');
      const findColumn = [...columns].find((col) => col.className === card.column);
      findColumn.querySelector('.column__cards').append(card.create());
      this.count += 1;
    });
  }
}
