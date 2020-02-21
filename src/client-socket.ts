import path from 'path';

import WebSocket from 'ws';

import { EntityItem } from './entities';
import getEvents, { EventType } from './events';
import { updatePosition, createEntity } from './server/messages';
import GlobalContext from './context';
import { WSMessage } from './server/commands';

const events = getEvents();
const logger = require('logger').createLogger('./logs/client-socket.log');

export default class ClientSocket {
    private ws: WebSocket;

    public mode: string;

    constructor() {
        const ws = new WebSocket(`ws://${process.env.HOST}:${process.env.PORT}`);
        ws.on('open', () => {
            events.emit({
                type: EventType.WsOpen
            });
        });

        ws.on('message', msg => {
            let m;
            let type: EventType = EventType.WsMessage;

            if (typeof msg === 'string') {

                // @ts-ignore
                let wsMessage = JSON.parse(msg) as WSMessage;

                // TODO: Probably should have some thing here.  THis would be
                // like game specific stuffs.
                if (wsMessage.type === 'status') {
                    return;
                }

                m = wsMessage;
            }
            else {
                m = msg;
                type = EventType.WsBinary;
            }

            events.emit({
                type,
                data: m
            });
        });

        ws.on('close', () => {
            // TODO: reconnect socket.
        });

        ws.on('error', () => {
            // TODO: reconnect socket.
        });

        this.ws = ws;
    }

    createEntity(entityId: EntityItem, x: number, y: number) {

        const buf = createEntity({
            entityId,
            x,
            y
        });

        this.ws.send(buf);
    }

    confirmMovement(movementId: number) {
        logger.info(GlobalContext.player);
        const player = GlobalContext.player;
        const pos = player.position;

        const buf = updatePosition({
            cmd: player.lastMovement,
            movementId,
            entityId: player.entity,
            x: pos.x,
            y: pos.y
        });


        this.ws.send(buf);
    }
};
