import Client from "./Client";
import GameMessageBase, { GameMessageType, GameMessageMatchOver } from "./GameMessageBase";
import GameManager from "./GameManager";

export default class ClientManager {

    private static _instance: ClientManager = null;

    static getInstance(): ClientManager {
        if (!ClientManager._instance) {
            ClientManager._instance = new ClientManager();
        }
        return ClientManager._instance;
    }
    allClients: Client[] = [];
    matchingClient: Client[] = [];

    addClient(client: Client) {
        this.allClients.push(client);
    }

    match(client: Client) {
        if (this.matchingClient.length == 0) {
            this.matchingClient.push(client);
        } else {
            let pair = this.matchingClient.shift();
            GameManager.getInstance(GameManager).addGame(client,pair);
        }
    }

    removeClient(client:Client){
        let idx = this.allClients.indexOf(client);
        if(idx != -1){
            this.allClients.splice(idx,1);
        }
        idx = this.matchingClient.indexOf(client);
        if(idx != -1){
            this.allClients.splice(idx,1);
        }
    }
}