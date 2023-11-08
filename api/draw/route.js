"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var serverDebug = debug_1.default("server");
var ioDebug = debug_1.default("io");
var socketDebug = debug_1.default("socket");
require("dotenv").config(process.env.NODE_ENV !== "development"
    ? { path: ".env.production" }
    : { path: ".env.development" });
var app = express_1.default();
var port = process.env.PORT || (process.env.NODE_ENV !== "development" ? 80 : 3002); // default port to listen
app.use(express_1.default.static("public"));
app.get("/", function (req, res) {
    res.send("Excalidraw collaboration server is up :)");
});
var server = http_1.default.createServer(app);
server.listen(port, function () {
    serverDebug("listening on port: " + port);
});
try {
    var io_1 = new socket_io_1.Server(server, {
        transports: ["websocket", "polling"],
        cors: {
            allowedHeaders: ["Content-Type", "Authorization"],
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        },
        allowEIO3: true,
    });
    io_1.on("connection", function (socket) {
        ioDebug("connection established!");
        io_1.to("" + socket.id).emit("init-room");
        socket.on("join-room", function (roomID) { return __awaiter(void 0, void 0, void 0, function () {
            var sockets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        socketDebug(socket.id + " has joined " + roomID);
                        return [4 /*yield*/, socket.join(roomID)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, io_1.in(roomID).fetchSockets()];
                    case 2:
                        sockets = _a.sent();
                        if (sockets.length <= 1) {
                            io_1.to("" + socket.id).emit("first-in-room");
                        }
                        else {
                            socketDebug(socket.id + " new-user emitted to room " + roomID);
                            socket.broadcast.to(roomID).emit("new-user", socket.id);
                        }
                        io_1.in(roomID).emit("room-user-change", sockets.map(function (socket) { return socket.id; }));
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on("server-broadcast", function (roomID, encryptedData, iv) {
            socketDebug(socket.id + " sends update to " + roomID);
            socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
        });
        socket.on("server-volatile-broadcast", function (roomID, encryptedData, iv) {
            socketDebug(socket.id + " sends volatile update to " + roomID);
            socket.volatile.broadcast
                .to(roomID)
                .emit("client-broadcast", encryptedData, iv);
        });
        socket.on("disconnecting", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, _i, roomID, otherClients;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        socketDebug(socket.id + " has disconnected");
                        _a = [];
                        for (_b in socket.rooms)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        roomID = _a[_i];
                        return [4 /*yield*/, io_1.in(roomID).fetchSockets()];
                    case 2:
                        otherClients = (_c.sent()).filter(function (_socket) { return _socket.id !== socket.id; });
                        if (otherClients.length > 0) {
                            socket.broadcast.to(roomID).emit("room-user-change", otherClients.map(function (socket) { return socket.id; }));
                        }
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        socket.on("disconnect", function () {
            socket.removeAllListeners();
            socket.disconnect();
        });
    });
}
catch (error) {
    console.error(error);
}
