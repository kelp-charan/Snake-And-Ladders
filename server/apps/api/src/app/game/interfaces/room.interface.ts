import { Player } from './player.interface';

export interface Room {
  roomId: string;
  admin: string;
  players: Player[];
}
