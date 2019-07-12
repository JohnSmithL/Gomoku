import * as Websocket from 'ws';
import * as http from 'http';



let ws = new Websocket.Server({port:8080});

ws.on('connection',(socket:Websocket,request:http.IncomingMessage)=>{

    console.log("server get connection");
    socket.send("server send a message");

    socket.on("message",(data:Websocket.Data)=>{
        console.log(data);
    });
});