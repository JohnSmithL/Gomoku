
export default class GameData {
    tableData: GameChess[][];

    constructor() {

        this.tableData = [];
        for (let i = 0; i < 15; i++) {
            this.tableData[i] = [];
            for (let j = 0; j < 15; j++) {
                let chessData = new GameChess();
                this.tableData[i][j] = chessData;
            }
        }
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