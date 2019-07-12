import { GameChess, GameChessType } from "./GameData";
import GameMain from "./GameMain";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameChessUI extends cc.Component {

    @property(cc.Node)
    chessWhite: cc.Node = null;

    @property(cc.Node)
    chessBlack: cc.Node = null;

    @property(cc.Node)
    pointRed: cc.Node = null;
    i: number = 0;
    j: number = 0;

    gameMain: GameMain = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    refreshWith(chess: GameChess) {
        this.chessWhite.active = chess.chessType == GameChessType.White;
        this.chessBlack.active = chess.chessType == GameChessType.Black;
        this.pointRed.active = chess.isLastPutChess;

    }

    onClick() {
        this.gameMain.onClickChess(this.i, this.j);
    }
}
