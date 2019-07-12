import Singleton from "./Singleton";
import Client from "./Client";
import { GameMessageMatchOver, GameMessageS2C_Login, GamemessageSync } from "./GameMessageBase";
import GameData from "./GameData";

export default class GameManager extends Singleton<GameManager>{

    allGames: GameData[] = [];

    addGame(client0: Client, client1: Client) {

        let gameData = new GameData(client0, client1);
        this.allGames.push(gameData);
    }

    removeGame(gameData: GameData) {
        let idx = this.allGames.indexOf(gameData);

        if (idx != -1) {
            this.allGames.splice(idx, 1);
        }
    }

    checkIsInGame(uid:string,callback:GameMessageS2C_Login,client:Client){
        for (let i = 0,length = this.allGames.length; i < length; i++) {
            let game = this.allGames[i];
            if(game.disconnectUid == uid){
                let sync = new GamemessageSync();
                sync.myUid = uid;
                sync.otherUid = game.clients[0].uid;
                sync.myChessType = game.getPairChessType();
                sync.tableData = game.tableData;
                callback.sync = sync;
                game.reconnect(client);
            } 
        }
    }
}