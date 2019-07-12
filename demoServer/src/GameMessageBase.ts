import { GameChessType, GameChess } from "./GameData";

export default class GameMessageBase{
    type:GameMessageType;
}

export class GameMessageC2S extends GameMessageBase{

}

export class GameMessageS2C extends GameMessageBase{
    code:number;
}

export enum GameMessageType{
    C2S_Regist,
    C2S_Login,
    Hello,
    C2S_Match,
    C2S_Put,
    S2C_MatchOver,
    S2C_Regist,
    S2C_Login,
}

export class GameMessagePut extends GameMessageBase{
    type:GameMessageType = GameMessageType.C2S_Put;
    uid:string;
    i:number;
    j:number;
    chessType:GameChessType;

    constructor(uid:string,i:number,j:number,chessType:GameChessType){
        super();
        this.uid = uid;
        this.i = i;
        this.j = j;
        this.chessType = chessType;
    }
}

export class GamemessageC2S_Match extends GameMessageC2S{
    type:GameMessageType = GameMessageType.C2S_Match;
}

export interface IGameStart{
    myUid:string;
    otherUid:string;
    myChessType:number;
}

export class GameMessageMatchOver extends GameMessageBase{
    type:GameMessageType = GameMessageType.S2C_MatchOver;
    myUid:string;
    otherUid:string;
    myChessType:number;
}

export class GameMessageC2S_Regist extends GameMessageC2S{
    type:GameMessageType = GameMessageType.C2S_Regist;

    constructor(public username:string,public password:string){
        super();
    }
}

export class GameMessageS2C_Regist extends GameMessageS2C{
    type:GameMessageType = GameMessageType.S2C_Regist;
}

export class GameMessageC2S_Login extends GameMessageC2S{
    type:GameMessageType = GameMessageType.C2S_Login;

    constructor(public username:string,public password:string){
        super();
    }
}

export class GameMessageS2C_Login extends GameMessageS2C{
    type:GameMessageType = GameMessageType.S2C_Login;
    uid:string;
    sync:GamemessageSync;
}

export class GamemessageSync{
    myUid:string;
    otherUid:string;
    myChessType:number;
    tableData:GameChess[][];
}