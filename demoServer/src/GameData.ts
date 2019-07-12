import Client from "./Client";
import { GameMessageMatchOver, GameMessagePut } from "./GameMessageBase";
import GameManager from "./GameManager";

export default class GameData {

    clients: Client[] = [];
    tableData: GameChess[][];
    lastChess: GameChess;

    chessTypeMap: Map<string, GameChessType> = new Map<string, GameChessType>();

    disconnectUid: string;
    constructor(client0: Client, client1: Client) {
        this.tableData = [];
        for (let i = 0; i < 15; i++) {
            this.tableData[i] = [];
            for (let j = 0; j < 15; j++) {
                let chessData = new GameChess();
                this.tableData[i][j] = chessData;
            }
        }

        client0.pairClient = client1;
        client1.pairClient = client0;

        let msg0 = new GameMessageMatchOver();
        msg0.myUid = client0.uid;
        msg0.otherUid = client1.uid;
        msg0.myChessType = 1;
        client0.send(msg0);


        let msg1 = new GameMessageMatchOver();
        msg1.myUid = client1.uid;
        msg1.otherUid = client0.uid;
        msg1.myChessType = 2;
        client1.send(msg1);

        this.addClient(client0, 1);
        this.addClient(client1, 2);
    }

    addClient(client: Client, chessType: GameChessType) {
        this.clients.push(client);
        client.gameData = this;
        this.chessTypeMap.set(client.uid, chessType);
    }

    onPut(msg: GameMessagePut) {
        for (let i = 0, length = this.clients.length; i < length; i++) {
            let client = this.clients[i];
            client.send(msg);
        }

        let chess = this.tableData[msg.i][msg.j];
        chess.chessType = msg.chessType;

        if (this.lastChess) {
            this.lastChess.isLastPutChess = false;
        }

        this.lastChess = chess;
        this.lastChess.isLastPutChess = true;
    }

    disconnect(client: Client) {
        for (let i = 0, length = this.clients.length; i < length; i++) {
            let c = this.clients[i];
            if (c == client) {
                this.clients.splice(i, 1);
                break;
            }
        }
        this.chessTypeMap.delete(client.uid);
        this.disconnectUid = client.uid;
        client.gameData = null;

        if (this.clients.length == 0) {
            GameManager.getInstance(GameManager).removeGame(this);
        }
    }

    getPairChessType(): GameChessType {
        let pairChessType = this.chessTypeMap.get(this.clients[0].uid);
        return pairChessType == GameChessType.White ? GameChessType.Black : GameChessType.White;
    }

    reconnect(client:Client){
        this.addClient(client,this.getPairChessType());
        client.pairClient = this.clients[0];
        this.clients[0].pairClient = client;
    }
}

export class GameChess {
    chessType: GameChessType = GameChessType.None;
    isLastPutChess: boolean = false;
}

export enum GameChessType {
    None,
    White,
    Black
}