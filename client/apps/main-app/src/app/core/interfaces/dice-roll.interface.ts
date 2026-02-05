import { IRoom } from '@snake-and-ladders-monorepo/interfaces';

export interface IDiceRollResult {
  diceValue: number;
  playerTurn: number;
  playerIndex: number;
  newPosition: number;
  room: IRoom;
}
