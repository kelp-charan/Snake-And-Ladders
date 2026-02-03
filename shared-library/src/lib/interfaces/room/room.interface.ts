import { GameState } from "../../enums";

import { Player } from "../player/player.interface";

export interface Room {
  roomId: string;
  admin: string;
  players: Player[];
  gameState: GameState;
  turn: number;
}
