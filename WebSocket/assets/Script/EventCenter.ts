// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


export default class EventCenter {
    private static events: Map<string, Array<EventHandler>> = new Map<string, Array<EventHandler>>();
    static registEvent(eventName: string, callBack: Function, target: object) {
        if (eventName == undefined || callBack == undefined || target == undefined) {
            throw Error("regist event error");
        }

        if (EventCenter.events[eventName] == undefined) {
            EventCenter.events[eventName] = new Array<EventHandler>();
        }

        let handler = new EventHandler(target, callBack);
        EventCenter.events[eventName].push(handler);
    }

    static postEvent(eventName: string, param?: any) {
        let handlers = EventCenter.events[eventName];

        if (handlers == undefined) {
            return;
        }

        console.log("post Event:", eventName);

        for (let i = 0; i < handlers.length; i++) {
            let handler = handlers[i];

            if (handler) {
                try {
                    handler.function.call(handler.target, param);
                } catch (e) {
                    console.log(e.message);
                    console.log(e.stack.toString());
                }
            }

        }
    }

    static removeEvent(eventName: string, callBack: Function, target: object): void {
        let handlers = EventCenter.events[eventName];
        if(handlers == undefined){
            return;
        }

        for (let i = 0; i < handlers.lenght;i++){
            let handler = handlers[i];

            if(handlers != undefined &&handler.target == target &&handler.function == callBack){
                handlers[i] = undefined;
                break;
            }
        }  
    }




}
class EventHandler {
    target: object;
    function: Function;

    constructor(target: object, func: Function) {
        this.target = target;
        this.function = func;
    }

}
