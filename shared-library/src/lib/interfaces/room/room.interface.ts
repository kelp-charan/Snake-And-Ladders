import { GameState } from "../../enums";

import { IPlayer } from "../player/player.interface";

export interface IRoom {
  roomId: string;
  admin: string;
  players: IPlayer[];
  gameState: GameState;
  turn: number;
}
