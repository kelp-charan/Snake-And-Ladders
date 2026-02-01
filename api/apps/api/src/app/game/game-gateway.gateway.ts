import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// import { Room } from './interfaces/room.interface';
// import { Player } from './interfaces/player.interface';

import { GameState } from '@snake-and-ladders-monorepo/enums';
import { Player, Room } from '@snake-and-ladders-monorepo/interfaces';

interface ServerPlayer extends Player {
  disconnectedTimer?: ReturnType<typeof setTimeout>;
}
interface ServerRoom extends Room {
  players: ServerPlayer[];
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  },
})
export class GameGatewayGateway {
  @WebSocketServer()
  private server: Server;

  private rooms = new Map<string, ServerRoom>();

  @SubscribeMessage('createRoom')
  createRoom(
    @MessageBody() data: { roomId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, username } = data;

    if (this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room already exists' });
      return;
    }

    const newRoom: ServerRoom = {
      roomId: roomId,
      admin: username,
      gameState: GameState.WAITING,
      turn: 0,
      players: [
        {
          socketId: client.id,
          username: username,
          character: 1,
          isReady: false,
          currPosition: 1,
        },
      ],
    };
    this.rooms.set(roomId, newRoom);
    client.join(roomId);

    client.emit('roomCreated', { success: true, playerId: 0 });
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody() data: { roomId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, username } = data;

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);

    if (room.players.length >= 4) {
      client.emit('error', { message: 'Room is full' });
      return;
    }

    const character = room.players.length + 1;
    const newPlayer: ServerPlayer = {
      socketId: client.id,
      username: username,
      character: character as 1 | 2 | 3 | 4,
      isReady: false,
      currPosition: 1,
    };

    room.players.push(newPlayer);
    this.rooms.set(roomId, room);
    client.join(roomId);

    this.server
      .to(client.id)
      .emit('roomJoined', { success: true, playerId: character - 1 });
    this.server.to(roomId).emit('playerJoined', room);
  }

  private getClientRoom(room: ServerRoom): Room {
    return {
      roomId: room.roomId,
      admin: room.admin,
      gameState: room.gameState,
      turn: room.turn,
      players: room.players.map((player) => ({
        socketId: player.socketId,
        username: player.username,
        character: player.character,
        isReady: player.isReady,
        currPosition: player.currPosition,
      })),
    };
  }

  @SubscribeMessage('roomDetails')
  getRoomDetails(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);
    console.log('Room details (Before): ', room);
    client.join(roomId);

    console.log('Sending room details: ', room);
    console.log('To client ID: ', client.id);

    const clietntRoom: Room = this.getClientRoom(room);

    this.server.to(client.id).emit('roomDetails', clietntRoom);
  }

  @SubscribeMessage('rejoinRoom')
  rejoinRoom(
    @MessageBody() data: { roomId: string; username: string; playerId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, username, playerId } = data;

    console.log(
      `Rejoin request for roomId: ${roomId}, username: ${username}, playerId: ${playerId}`,
    );

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);
    const existingPlayer = room.players.find(
      (player) => player.username === username,
    );

    if (!existingPlayer) {
      client.emit('error', { message: 'Player not found in room' });
      return;
    }

    if (existingPlayer.disconnectedTimer) {
      clearTimeout(existingPlayer.disconnectedTimer);
      existingPlayer.disconnectedTimer = undefined;
    }

    existingPlayer.socketId = client.id;
    existingPlayer.disConnected = false;

    this.rooms.set(roomId, room);
    client.join(roomId);

    console.log(`Player ${username} rejoined room ${roomId}`);

    const clientRoom: Room = this.getClientRoom(room);
    this.server.to(client.id).emit('roomDetails', clientRoom);
  }

  // ==========  Game Logic ==========

  @SubscribeMessage('changeStatus')
  changeStatus(
    @MessageBody() data: { roomId: string; status: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, status } = data;
    const socketId = client.id;

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);
    const playerIndex = room.players.findIndex(
      (player) => player.socketId === socketId,
    );

    if (playerIndex === -1) {
      client.emit('error', { message: 'Player not found in room' });
      return;
    }

    room.players[playerIndex].isReady = status;
    this.rooms.set(roomId, room);

    const clientRoom: Room = this.getClientRoom(room);
    this.server.to(roomId).emit('statusChanged', clientRoom);
  }

  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);

    const allReady: boolean = room.players.every((player) => player.isReady);
    if (!allReady) {
      client.emit('error', { message: 'Not all players are ready' });
      return;
    }

    room.gameState = GameState.STARTED;
    this.server.to(roomId).emit('gameStarted', true);
  }

  // ========= Dice Roll Logic ==========

  // private snakes = new Map<number, number>([
  //   [48, 28],
  //   [67, 24],
  //   [79, 59],
  //   [74, 52],
  //   [83, 19],
  //   [96, 76]
  // ]);

  // private ladders = new Map<number, number>([
  //   [8, 13],
  //   [18, 65],
  //   [27, 46],
  //   [60, 61],
  //   [68, 89],
  // ]);

  @SubscribeMessage('rollDice')
  rollDice(
    @MessageBody() data: { roomId: string; diceValue: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, diceValue } = data;
    const socketId = client.id;

    if (!this.rooms.has(roomId)) {
      client.emit('error', { message: 'Room does not exist' });
      return;
    }

    const room = this.rooms.get(roomId);

    const playerIndex = room.players.findIndex((p) => p.socketId === socketId);
    if (playerIndex === -1) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    if (room.turn !== playerIndex) {
      client.emit('error', { message: 'Not your turn' });
      return;
    }

    const player = room.players[playerIndex];
    let newPosition = player.currPosition + diceValue;

    if (newPosition > 100) {
      newPosition = player.currPosition;
    } else if (newPosition === 100) {
      player.currPosition = 100;
      room.gameState = GameState.ENDED;
      this.rooms.set(roomId, room);

      // this.server.to(roomId).emit('gameEnded', {
      //   winner: player.username,
      //   room
      // });
      // return;
    }

    // if (this.snakes.has(newPosition)) {
    //   const snakeTail = this.snakes.get(newPosition);
    //   console.log(`Player ${player.username} hit snake at ${newPosition}, sliding to ${snakeTail}`);
    //   newPosition = snakeTail;
    // }

    // if (this.ladders.has(newPosition)) {
    //   const ladderTop = this.ladders.get(newPosition);
    //   console.log(`Player ${player.username} hit ladder at ${newPosition}, climbing to ${ladderTop}`);
    //   newPosition = ladderTop;
    // }

    player.currPosition = newPosition;

    let nextTurn = room.turn;
    if (diceValue !== 6) {
      nextTurn = (room.turn + 1) % room.players.length;
    }
    room.turn = nextTurn;

    this.rooms.set(roomId, room);

    this.server.to(roomId).emit('diceRolled', {
      diceValue,
      playerTurn: nextTurn,
      playerIndex,
      newPosition,
      room,
    });
  }

  @SubscribeMessage('gameEnded')
  gameEnded(
    @MessageBody() data: { winnerName: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { winnerName, roomId } = data;

    if (winnerName.trim() === '') return;

    if (!this.rooms.has(roomId)) {
      client.emit('error', 'Room does not exists');
      return;
    }

    this.server.to(roomId).emit('gameEnded', { winner: winnerName });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const socketId = client.id;

    this.rooms.forEach((room, roomId) => {
      const player = room.players.find((p) => p.socketId === socketId);

      if (!player) return;

      player.disConnected = true;

      player.disconnectedTimer = setTimeout(() => {
        const playerIdx = room.players.findIndex(
          (p) => p.socketId === socketId,
        );

        if (playerIdx !== -1) {
          room.players.splice(playerIdx, 1);
          console.log(
            `Player ${player.username} removed from room ${roomId} after timeout`,
          );

          if (room.players.length === 0) {
            this.rooms.delete(roomId);
            console.log(`Room ${roomId} deleted as it became empty`);
          } else {
            if (room.admin === player.username) {
              room.admin = room.players[0].username;
              console.log(`Admin left. New admin is ${room} in room ${roomId}`);
            }
            this.rooms.set(roomId, room);
            this.server
              .to(roomId)
              .emit('roomDetails', this.getClientRoom(room));
          }
        }
      }, 5000);
    });
  }
}
