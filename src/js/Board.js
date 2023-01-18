/* eslint-disable class-methods-use-this */
import Card from './Card';
import DragElem from './DragElem';
import State from './State';

export default class Board {
  constructor(stateService) {
    this.element = document.querySelector('.board');
    this.stateService = stateService;
    this.state = new State();
    this.count = 1;
    this.dragEl = null;
    this.underDrag = null;
    // this.underDragParent = null;
    this.isColumn = null;
    this.isColumnCardUnderDrag = null;
    this.isColumnFooterElemUnderDrag = null;
    this.isColumnFooterUnderDrag = null;

    this.onClickCardDelete = this.onClickCardDelete.bind(this);
    this.onClickFooter = this.onClickFooter.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
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

    blocksWithCards.forEach((card) => {
      card.addEventListener('mousedown', this.onMouseDown);
      card.addEventListener('click', this.onClickCardDelete);
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
    });
  }

  onMouseDown(e) {
    if (!e.target.classList.contains('column__card')) return;
    // console.log(`onMouseDown, clientX - ${e.clientX}`);
    // console.log(`onMouseDown, clientY - ${e.clientY}`);

    e.preventDefault();
    document.documentElement.style.cursor = 'grabbing';
    this.dragEl = new DragElem(e.target, e.clientX, e.clientY);
    this.dragEl.card = this.state.cards.find((c) => c.id === Number(this.dragEl.elem.getAttribute('data-id')));
    this.dragEl.index = this.state.cards.indexOf(this.dragEl.card);

    this.dragEl.bindToDOM(e.clientX, e.clientY);
    document.documentElement.addEventListener('mouseup', this.onMouseUp);
    document.documentElement.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(e) {
    // console.log(`onMouseMove, clientX - ${e.clientX}`);
    // console.log(`onMouseMove, clientY - ${e.clientY}`);
    // console.log('onMouseMove, e.target - ', e.target);
    // console.log('onMouseMove, underDrag - ', this.underDrag);

    this.dragEl.move(e.clientX, e.clientY);
    this.renderGhost(e.target);
  }

  onMouseUp() {
    // console.log('onMouseUp, e.target - ', e.target);
    console.log('onMouseUp, underDrag - ', this.underDrag);

    document.documentElement.style.cursor = 'auto';

    if (this.underDrag.tagName !== 'HTML' && this.underDrag.tagName !== 'BODY') {
      if (this.isGhostUnderDrag) {
        if (this.underDrag.nextElementSibling) {
          this.underDrag = this.underDrag.nextElementSibling;
          // this.underDragParent = this.underDrag.parentElement;
        } else {
          this.underDrag = this.underDrag.closest('.column').querySelector('.column__footer');
        }
      }

      this.isColumnCardUnderDrag = this.underDrag.parentElement.classList.contains('column__cards');
      this.isColumnFooterElemUnderDrag = this.underDrag.parentElement.classList.contains('column__footer');
      this.isColumnFooterUnderDrag = this.underDrag.classList.contains('column__footer');
      this.isGhostUnderDrag = this.underDrag.classList.contains('ghost');

      this.dragEl.ghost.delete();

      if (this.isColumnCardUnderDrag) {
        this.changeOrderInState('column__cards', this.underDrag);
        this.underDrag.parentElement.insertBefore(this.dragEl.elem, this.underDrag);
        this.dragEl.ghost.delete();
      }

      if (this.isColumnFooterElemUnderDrag) {
        this.dragEl.ghost.delete();
        const columnCards = this.underDrag.parentElement.parentElement.querySelector('.column__cards');
        this.changeOrderInState('column__footer', columnCards.children[columnCards.children.length - 1]);
        columnCards.append(this.dragEl.elem);
      }

      if (this.isColumnFooterUnderDrag) {
        this.dragEl.ghost.delete();
        const columnCards = this.underDrag.parentElement.querySelector('.column__cards');
        this.changeOrderInState('column__footer', columnCards.children[columnCards.children.length - 1]);
        columnCards.append(this.dragEl.elem);
      }
    }
    this.clearElements();

    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mousemove', this.onMouseMove);

    console.log(this.state.cards);
  }

  renderGhost(target) {
    this.isColumn = !!target.closest('.column');
    // console.log(`renderGhost, target - `, target);
    // console.log(`renderGhost, isColumn - `, this.isColumn);
    // console.log(target.closest('.column'));

    if (this.isColumn) {
      this.underDrag = target;
      // this.underDragParent = this.underDrag.parentElement;
      this.isColumnCardUnderDrag = this.underDrag.parentElement.classList.contains('column__cards');
      this.isColumnFooterElemUnderDrag = this.underDrag.parentElement.classList.contains('column__footer');
      this.isColumnFooterUnderDrag = this.underDrag.classList.contains('column__footer');
      this.isGhostUnderDrag = this.underDrag.classList.contains('ghost');

      if (this.isColumnCardUnderDrag) {
        this.underDrag.parentElement.insertBefore(this.dragEl.ghost.elem, this.underDrag);
      }

      if (this.isColumnFooterElemUnderDrag) {
        this.underDrag.parentElement.parentElement.querySelector('.column__cards').append(this.dragEl.ghost.elem);
      }

      if (this.isColumnFooterUnderDrag) {
        this.underDrag.parentElement.querySelector('.column__cards').append(this.dragEl.ghost.elem);
      }
    }
  }

  changeOrderInState(block, card) {
    let slidingCard;
    let slidingCardIdx;

    if (card) {
      slidingCard = this.state.cards.find((c) => c.id === Number(card.getAttribute('data-id')));
      slidingCardIdx = this.state.cards.indexOf(slidingCard);
    }
    const delActualEl = this.state.cards.splice(this.dragEl.index, 1)[0];

    if (block === 'column__cards') {
      if (slidingCardIdx > this.dragEl.index) {
        this.state.cards.splice(slidingCardIdx - 1, 0, delActualEl);
      } else {
        this.state.cards.splice(slidingCardIdx, 0, delActualEl);
      }
    }

    if (block === 'column__footer') {
      if (!card) {
        this.state.cards.unshift(delActualEl);
      } else {
        this.state.cards.splice(slidingCardIdx + 1, 0, delActualEl);
      }
    }

    if (this.underDrag.classList.contains('column__footer')) {
      this.dragEl.card.column = this.underDrag.parentElement.className;
    } else {
      this.dragEl.card.column = this.underDrag.parentElement.parentElement.className;
    }
  }

  clearElements() {
    this.dragEl.clear();
    this.dragEl = null;
    this.underDrag = null;
    // this.underDragParent = null;
    this.isColumn = null;
    this.isColumnCardUnderDrag = null;
    this.isColumnFooterElemUnderDrag = null;
    this.isColumnFooterUnderDrag = null;
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
      footer.insertAdjacentHTML('beforeend', Board.markupSaveBtn);
      return;
    }

    if (footer.children.length > 1) {
      [...footer.children].forEach((child) => child.remove());
      footer.insertAdjacentHTML('beforeend', Board.markupAddBtn);
    }
  }

  onClickSave(target) {
    const column = target.closest('.column');
    const columnCards = column.querySelector('.column__cards');
    const msg = column.querySelector('.column__add-textarea').value;
    const card = new Card(msg, column.className, this.count);

    this.state.cards.push(card);

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
