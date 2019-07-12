import config from "./config";
import GameData, { GameChessType, GameChess } from "./GameData";
import GameChessUI from "./GameChessUI";
import GamePlayer from "./GamePlayer";
import WSClient from "./WSClient";
import { GameMessagePut, GameMessageMatchOver, GameMessageS2C_Login, IGameStart } from "./GameMessageBase";
import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {

    @property(cc.Node)
    tableCenter: cc.Node = null;

    @property(cc.Prefab)
    prefabChess: cc.Prefab = null;

    @property(cc.Label)
    lbRound: cc.Label = null;

    gameData: GameData;

    allChess: GameChessUI[][];

    selfPlayer: GamePlayer;
    otherPlayer: GamePlayer;
    currentPlayer: GamePlayer;
    lastPutChess: GameChessUI = null;


    onLoad() {

        this.gameData = new GameData();

        this.allChess = [];
        for (let i = 0; i < 15; i++) {
            this.allChess[i] = [];
            for (let j = 0; j < 15; j++) {
                let chess = cc.instantiate(this.prefabChess).getComponent(GameChessUI);
                chess.node.x = (i - 7) * config.ChessSpaceWidth;
                chess.node.y = (j - 7) * config.ChessSpaceHeight;
                chess.node.parent = this.tableCenter;
                chess.i = i;
                chess.j = j;

                chess.gameMain = this;
                this.allChess[i][j] = chess;

            }
        }
        this.refreshTable();
        // this.creatPlayer();

        EventCenter.registEvent(EventDefine.EVENT_MATCH_OVER, this.onMsgMatchOver, this);
        EventCenter.registEvent(EventDefine.EVENT_PUT, this.onMsgPut, this);
        EventCenter.registEvent(EventDefine.EVENT_SYNC, this.onSync, this);

    }

    onSync(msg: GameMessageS2C_Login) {
        this.onMsgMatchOver(msg.sync);

        let sync = msg.sync;
        this.gameData.tableData = sync.tableData;

        this.refreshTable((chess:GameChess,chessUI:GameChessUI)=>{
            if(chess.isLastPutChess){
                this.lastPutChess = chessUI;
                if(this.selfPlayer.chessType == chess.chessType){
                    this.currentPlayer = this.otherPlayer;
                }else{
                    this.currentPlayer = this.selfPlayer;
                }
                this.updateRound();
            }
        });
    }

    onMsgMatchOver(msg: IGameStart) {
        let PlayerSelf = new GamePlayer();
        PlayerSelf.uid = msg.myUid;
        PlayerSelf.chessType = msg.myChessType;
        PlayerSelf.userName = "Player1";
        PlayerSelf.isSelfPlayer = true;
        this.selfPlayer = PlayerSelf;


        let PlayerOther = new GamePlayer();
        PlayerOther.uid = msg.otherUid;
        PlayerOther.chessType = msg.myChessType == GameChessType.Black ? GameChessType.White : GameChessType.Black;
        PlayerOther.userName = "Player2";
        PlayerOther.isSelfPlayer = false;
        this.otherPlayer = PlayerOther;

        if (PlayerSelf.chessType == GameChessType.White) {
            this.currentPlayer = PlayerSelf;
        } else {
            this.currentPlayer = PlayerOther;
        }

        this.updateRound();
    }

    changePlayer(currentPlayerUid: string) {
        if (currentPlayerUid == this.selfPlayer.uid) {
            this.currentPlayer = this.otherPlayer;
        } else {
            this.currentPlayer = this.selfPlayer;
        }
    }

    updateRound() {
        if (this.currentPlayer == this.selfPlayer) {
            this.lbRound.string = "Your Round";
        } else {
            this.lbRound.string = "Your opponent's Round"
        }
    }

    refreshTable(func?:(chessData: GameChess,chessUI:GameChessUI) => void) {
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            let chess = this.allChess[i][j];
            let data = this.gameData.tableData[i][j];
            chess.refreshWith(data);
            if(func){
                func(data,chess);
            }
        }
    }
}

onClickChess(i: number, j: number) {
    console.log("i: " + i, "j: " + j);

    if (this.currentPlayer == null) {
        return;
    }
    if (this.currentPlayer.isSelfPlayer) {
        WSClient.getInstance().send(new GameMessagePut(this.selfPlayer.uid, i, j, this.currentPlayer.chessType));
    }

    this.currentPlayer = null;


}

onMsgPut(msg: GameMessagePut) {
    let player = this.getPlayer(msg.uid);
    this.putChess(player.chessType, msg.i, msg.j);
    this.checkWin(msg.i, msg.j);
    this.changePlayer(msg.uid);

    this.updateRound();
}

getPlayer(uid: string): GamePlayer{
    if (uid == this.selfPlayer.uid) {
        return this.selfPlayer;
    } else if (uid == this.otherPlayer.uid) {
        return this.otherPlayer;
    }
}

putChess(chessType: GameChessType, i: number, j: number) {
    let data = this.getChessData(i, j);
    let chess = this.getChess(i, j);
    
    if (this.lastPutChess) {
        this.lastPutChess.pointRed.active = false;
        this.getChessData(this.lastPutChess.i, this.lastPutChess.j).isLastPutChess = false;
    }
    
    this.lastPutChess = chess;
    data.isLastPutChess = true;
    data.chessType = chessType;
    chess.refreshWith(data);
}

getChessData(i: number, j: number): GameChess {
    return this.gameData.tableData[i][j];
}

getChess(i: number, j: number): GameChessUI {
    return this.allChess[i][j];
}

checkWin(i: number, j: number) {
    let chessData = this.getChessData(i, j);
    let chessType = chessData.chessType;

    let result = this.checkHorizontal(i, j, chessType)
        || this.checkVertical(i, j, chessType)
        || this.checkObliqueUp(i, j, chessType)
        || this.checkObliqueDown(i, j, chessType);

    if (result) {
        console.log("win", chessData.chessType);
    }
}

checkHorizontal(posi: number, posj: number, chessType: GameChessType): boolean {
    let total = 1;
    for (let i = posi - 1; i >= 0; i--) {
        if (this.getChessData(i, posj).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    for (let i = posi + 1; i < config.GirdHorizontalCount; i++) {
        if (this.getChessData(i, posj).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    return total >= 5;
}

checkVertical(posi: number, posj: number, chessType: GameChessType): boolean {
    let total = 1;
    for (let j = posj - 1; j >= 0; j--) {
        if (this.getChessData(posi, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    for (let j = posj + 1; j < config.GirdVertalCount; j++) {
        if (this.getChessData(posi, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }

    return total >= 5;
}

checkObliqueUp(posi: number, posj: number, chessType: GameChessType): boolean {
    let total = 1;
    for (let i = posi + 1, j = posj + 1; i < config.GirdHorizontalCount && j < config.GirdVertalCount; i++ , j++) {
        if (this.getChessData(i, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    for (let i = posi - 1, j = posj - 1; i >= 0 && j >= 0; i-- , j--) {
        if (this.getChessData(i, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    return total >= 5;
}

checkObliqueDown(posi: number, posj: number, chessType: GameChessType): boolean {
    let total = 1;
    for (let i = posi - 1, j = posj + 1; i >= 0 && j < config.GirdVertalCount; i-- , j++) {
        if (this.getChessData(i, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    for (let i = posi + 1, j = posj - 1; i < config.GirdHorizontalCount && j >= 0; i++ , j--) {
        if (this.getChessData(i, j).chessType == chessType) {
            total++;
        } else {
            break;
        }
    }
    return total >= 5;
}
}
