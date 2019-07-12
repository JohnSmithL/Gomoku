import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import { GameMessageC2S_Regist, GameMessageS2C_Regist, GameMessageType, GameMessageC2S_Login, GameMessageS2C_Login, GameMessageS2C, GameMessageC2S, GamemessageC2S_Match, GameMessageMatchOver } from "./GameMessageBase";
import WSClient from "./WSClient";

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
export default class NewClass extends cc.Component {

    @property(cc.Label)
    lbCallBack: cc.Label = null;

    @property(cc.EditBox)
    ebUserName: cc.EditBox = null;

    @property(cc.EditBox)
    ebPassWord: cc.EditBox = null;

    @property(cc.Node)
    nodeLogin:cc.Node = null;

    @property(cc.Node)
    nodeMatch:cc.Node = null;

    status: number = 0;

    onLoad() {

        this.nodeLogin.active = true;
        this.nodeMatch.active = false;
        EventCenter.registEvent(EventDefine.EVENT_NETWORK_CONNECT, this.onNetWorkConnect, this);
        EventCenter.registEvent(GameMessageType.S2C_Regist.toString(), this.onRegistCallBack, this);
        EventCenter.registEvent(GameMessageType.S2C_Login.toString(), this.onLoginCallBack, this);
        EventCenter.registEvent(GameMessageType.S2C_MatchOver.toString(),this.onMatchOver,this);
    }

    onDestroy() {
        EventCenter.removeEvent(EventDefine.EVENT_NETWORK_CONNECT, this.onNetWorkConnect, this);
        EventCenter.removeEvent(GameMessageType.S2C_Regist.toString(), this.onRegistCallBack, this);
        EventCenter.removeEvent(GameMessageType.S2C_Login.toString(), this.onLoginCallBack, this);
        EventCenter.removeEvent(GameMessageType.S2C_MatchOver.toString(),this.onMatchOver,this);
    }

    onClickRegist() {
        this.status = 1;
        WSClient.getInstance().connect();
    }

    onClickLogin() {
        this.status = 0;
        WSClient.getInstance().connect();
    }

    onClickMatch(){
        WSClient.getInstance().send(new GamemessageC2S_Match);
        this.lbCallBack.string = "matching";
    }

    onNetWorkConnect() {
        if (this.status == 1) {
            this.regist();
        } else {
            this.login();
        }
    }

    regist() {
        console.log("regist")
        let username = this.ebUserName.string;
        let password = this.ebPassWord.string;
        let msg = new GameMessageC2S_Regist(username, password);

        WSClient.getInstance().send(msg);
    }

    onRegistCallBack(msg: GameMessageS2C_Regist) {
        if (msg.code == 0) {
            this.lbCallBack.string = "registed";
        } else {
            this.lbCallBack.string = "already have same username";
        }
    }

    login() {
        console.log("login");
        let username = this.ebUserName.string;
        let password = this.ebPassWord.string;

        let msg = new GameMessageC2S_Login(username, password);

        WSClient.getInstance().send(msg);
    }

    onLoginCallBack(msg: GameMessageS2C_Login) {
        if (msg.code == 0) {
            this.lbCallBack.string = "Login Successful";
            this.nodeLogin.active = false;
            this.nodeMatch.active = true;
            console.log("sync",msg.sync);
            console.log("msg:",msg);

            if(msg.sync){
                cc.director.loadScene("Main",function(){
                    EventCenter.postEvent(EventDefine.EVENT_SYNC,msg);
                });
            }
        } else {
            this.lbCallBack.string = "have wrong username or password";
        }
    }

    onMatchOver(msg:GameMessageMatchOver){
        cc.director.loadScene("Main",function(){
            EventCenter.postEvent(EventDefine.EVENT_MATCH_OVER,msg);
        });
    }
}
