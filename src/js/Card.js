export default class Card {
  constructor(text, column) {
    this.text = text;
    this.column = column;
    this.id = performance.now();
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
