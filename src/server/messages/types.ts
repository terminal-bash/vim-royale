import {MovementCommand} from '../../types';

export enum FrameType {
    CreateEntity = 1,
    UpdatePosition = 2,
    CorrectPosition = 3,
    GameStateUpdate = 4,
};

export enum CreateType {
    Player = 0x0,
};

export type CreateEntityResult = {
    x: number;
    y: number;
    entityId: number;
};

// TODO: I hate this.
export type GameStateUpdateResults = {
    x: number;
    y: number;
    entityId: number;
    char: string;
};

export type CorrectPositionResult = {
    x: number;
    y: number;
    entityId: number;
    nextId: number;
};

export type UpdatePositionResult = {
    x: number;
    y: number;
    entityId: number;
    movementId: number;
    key: MovementCommand;
};
