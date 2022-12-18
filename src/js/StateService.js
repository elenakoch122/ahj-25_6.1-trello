export default class StateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('cards', JSON.stringify(state));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('cards'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
