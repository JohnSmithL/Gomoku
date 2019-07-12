import WebSocket = require("ws");
import GameMessageBase, { GameMessageType, GameMessageC2S, GameMessageC2S_Regist, GameMessageS2C_Regist, GameMessageC2S_Login, GameMessageS2C_Login, GameMessagePut } from "./GameMessageBase";
import ClientManager from "./ClientManager";
import DBManager from "./DBManager";
import { callbackify } from "util";
import uuid = require("uuid");
import { Md5 } from 'ts-md5/dist/md5';
import GameData from "./GameData";
import GameManager from "./GameManager";


export default class Client {
    ws: WebSocket;

    pairClient: Client;
    uid: string;

    gameData:GameData;

    constructor(socket: WebSocket) {
        this.ws = socket;

        socket.on("message", this.onMessage.bind(this));
        socket.on("close",this.onClose.bind(this));
    }

    onMessage(data: WebSocket.Data) {

        let msg = JSON.parse(data as string) as GameMessageBase;

        if (msg.type == GameMessageType.Hello) {
            console.log((msg));
        } else if (msg.type == GameMessageType.C2S_Match) {
            ClientManager.getInstance().match(this);
        } else if (msg.type == GameMessageType.C2S_Put) {
            this.send(msg);
            this.pairClient.send(msg);
            
            this.gameData.onPut(msg as GameMessagePut);
        } else if (msg.type == GameMessageType.C2S_Regist) {
            let regist = msg as GameMessageC2S_Regist;

            DBManager.getUserCollection().find({ username: regist.username }).toArray((err, res: []) => {
                let callBack = new GameMessageS2C_Regist();
                if (res.length > 0) {
                    callBack.code = 1;
                    this.send(callBack);
                } else {
                    let uid = uuid.v1();
                    let username = regist.username;
                    let password = Md5.hashStr(regist.password);

                    let doc = { uid: uid, username: username, password: password };
                    console.log("regist user: ", doc);
                    DBManager.getUserCollection().insertOne(doc, (err, res) => {
                        if (err) {
                            throw err;
                        }
                        callBack.code = 0;
                        this.send(callBack);
                    });
                }
            });
        } else if (msg.type == GameMessageType.C2S_Login) {
            let login = msg as GameMessageC2S_Login
            let password = Md5.hashStr(login.password);
            DBManager.getUserCollection().findOne({ username: login.username, password: password }, (err, res) => {
                console.log("error:", err, "res:", res);
                let callback = new GameMessageS2C_Login;
                if (res) {
                    callback.code = 0;
                    callback.uid = res.uid;
                    this.uid = res.uid;
                    GameManager.getInstance(GameManager).checkIsInGame(res.uid,callback,this);
                    
                } else {
                    callback.code = 1;
                }
                this.send(callback);
            });
        }
    }

    send(msg: GameMessageBase) {
        let string = JSON.stringify(msg);
        console.log("send:", string);
        this.ws.send(string);
    }

    onClose(){
        if(this.gameData){
            this.gameData.disconnect(this);
        }
        ClientManager.getInstance().removeClient(this);
    }

}