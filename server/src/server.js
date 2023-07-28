import { WebSocketServer } from "ws";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

import { router } from "./routes.js";
import { webSocketHandler } from "./webapp.js";

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use("/", router);
app.use(express.static("client"));

const server = app.listen(8080, () => {
    console.log("Server up");
});

const wss = new WebSocketServer({
    server: server,
    path: "/ws"
});

wss.on('connection', webSocketHandler);
