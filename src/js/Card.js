export default class Card {
  constructor(text, column, id) {
    this.text = text;
    this.column = column;
    this.id = id;
  }

  create() {
    const card = document.createElement('div');
    card.classList.add('column__card');
    card.setAttribute('data-id', this.id);
    card.textContent = this.text;

    const close = document.createElement('span');
    close.classList.add('close', 'column__card-close');

    card.append(close);

    return card;
  }
}
