export default class Card {
  constructor(text) {
    this.text = text;
    this.element = this.create(text);
  }

  // static get markupCard() {
  //   return `
  //   <div class="column__card"><span class="close column__card-close"></span></div>
  //   `;
  // }

  create(text) {
    const card = document.createElement('div');
    card.classList.add('column__card');
    card.textContent = text;

    const close = document.createElement('span');
    close.classList.add('close', 'column__card-close');

    card.append(close);

    return card;
  }
}
