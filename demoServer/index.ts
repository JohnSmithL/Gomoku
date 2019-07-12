
import WebSocket = require('ws');
import * as http from "http"
import Client from './src/Client';
import ClientManager from './src/ClientManager';
import { MongoClient, MongoError } from 'mongodb';
import DBManager from './src/DBManager';


DBManager.getInstance(DBManager).connectDB();

let ws = new WebSocket.Server({ port: 8080 });

ws.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
    console.log("server get new connection")

    let client = new Client(socket);
    ClientManager.getInstance().addClient(client);
});


console.log('serverStart' + Date.parse(new Date().toString()));