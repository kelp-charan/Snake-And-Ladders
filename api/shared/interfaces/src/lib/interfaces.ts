import { GameState } from "@snake-and-ladders-monorepo/enums";

export interface Player {
  socketId: string;
  username: string;
  character: 1 | 2 | 3 | 4;
  isReady: boolean;
  currPosition: number;
  disConnected?: boolean;
}

export interface Room {
  roomId: string;
  admin: string;
  players: Player[];
  gameState: GameState;
  turn: number;
}