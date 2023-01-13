import Board from './Board';
import StateService from './StateService';

const stateService = new StateService(localStorage);
const board = new Board(stateService);
board.init();
