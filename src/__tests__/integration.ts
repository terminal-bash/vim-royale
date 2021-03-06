import dotenv from 'dotenv';
dotenv.config();

process.env.LOGGER_TYPE = 'log';
//process.env.SUPPRESS_LOGS = 'true';

jest.doMock('blessed', () => {
    return {
        box: () => {
            return {
                setContent: jest.fn()
            };
        }
    };
});

import {LocalContext, createLocalContext} from '../context';
import Game from '../index';
import Server from '../server';
import util from 'util';
import createInput from '../input';
import * as blessed from 'blessed';

function serverIsListening(server: Server) {
    return new Promise(function(res) {
        server.onListening(res);
    });
}

function gameIsConnected(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onConnected(res);
    });
}

function gameIsReadyToPlay(game: Game) {
    return new Promise(function(res) {
        // TODO: I HATE THE NAME OF THIS FUNCTION.
        game.onGameStart(res);
    });
}

jest.setTimeout(500000);

describe("integration", function() {
    let server: Server, game: Game[];
    let port: number = 1336;

    beforeEach(async function() {
        port++;

        server = new Server({
            port,
            width: 200,
            height: 200,
            tick: 1000,
            entityIdRange: 2000,
        });

        //await util.promisify(server.onListening.bind(server))();
        await serverIsListening(server);

        game = [];
    });

    afterEach(function() {
        console.log("aftereach");
        game.forEach(game => {
            game.shutdown();
        });

        console.log("server shutdown");
        server.shutdown();

        game = null;
        server = null;
    });

    function getKeyListeners(screen) {
    }

    type KeyListener = [string[], (ch: string) => void];
    function createScreen(keyListeners: KeyListener[] = []) {
        // @ts-ignore
        return {
            append: jest.fn(),
            render: jest.fn(),
                key: jest.fn((keys: string[], callback: (ch: string) => void) => {
                keyListeners.push([keys, callback]);
            }),
        } as blessed.Widgets.Screen;
    }

    function createGame(screen: blessed.Widgets.Screen, context: LocalContext = createLocalContext()): Game {
        const g = new Game(screen, {
            port,
            host: 'localhost',
            context,
        });
        game.push(g);
        return g;
    }

    function findMovementListener(listeners: KeyListener[]): KeyListener {
        return listeners.filter(listener => ~listener[0].indexOf('j'))[0];
    }

    it("should start a game and a server", async function() {
        await gameIsConnected(createGame(createScreen()));
    });

    it("connect multiple games to one server.", async function() {
        const g1 = createGame(createScreen());
        const g2 = createGame(createScreen());

        await Promise.all([gameIsConnected(g1), gameIsConnected(g2)]);
    });

    it.only("move the player around.", async function(done) {
        const listeners = [];
        const context = createLocalContext();
        const screen = createScreen(listeners);

        const g1 = createGame(screen, context);
        createInput(screen, context);

        await gameIsReadyToPlay(g1);

        const keyListener = findMovementListener(listeners);
        context.events.on((evt) => {
            console.log("LOOK AT ME MAW", evt, context.player);
            done();
        });
        keyListener[1]('j');
    });
});

