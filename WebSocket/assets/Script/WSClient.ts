import GameMessageBase, { GameMessageType } from "./GameMessageBase";
import EventDefine from "./EventDefine";
import EventCenter from "./EventCenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WSClient extends cc.Component {



    private static _instance: WSClient = null;

    static getInstance(): WSClient {
        return WSClient._instance;
    }

    ws: WebSocket;

    onLoad() {
        WSClient._instance = this;
        cc.game.addPersistRootNode(this.node);
    }

    start() {
    }

    connect() {
        console.log("client try connect server");
        this.ws = new WebSocket("ws://127.0.0.1:8080");

        this.ws.onopen = (ev: Event) => {
            //ws.send(JSON.stringify({type:0,body:"hello"}));

            // this.ws.send(JSON.stringify({ type: 1 }));

            EventCenter.postEvent(EventDefine.EVENT_NETWORK_CONNECT);
        }

        this.ws.onmessage = (ev: MessageEvent) => {
            console.log("onmessage", ev.data);

            let msg = JSON.parse(ev.data) as GameMessageBase;

           if (msg.type == GameMessageType.C2S_Put) {
                EventCenter.postEvent(EventDefine.EVENT_PUT, msg);
            } else {
                EventCenter.postEvent(msg.type.toString(), msg);
            }
        }
    }

    send(msg: GameMessageBase) {
        let string = JSON.stringify(msg);
        console.log("send:",string);
        this.ws.send(string);
    }
}
