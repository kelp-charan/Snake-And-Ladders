import { Player } from './player.interface';

export interface Room {
  roomId: string;
  players: Player[];
}
