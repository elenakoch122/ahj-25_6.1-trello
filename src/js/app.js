import Trello from './Trello';
import StateService from './StateService';

const stateService = new StateService(localStorage);
const trello = new Trello(stateService);
trello.init();
