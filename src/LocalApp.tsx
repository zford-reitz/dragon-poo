import React from 'react';
import {Client} from 'boardgame.io/react';
import {DragonPoo} from './Game';
import {DragonPooBoard} from './Board';
import {Local} from 'boardgame.io/multiplayer';

const DragonPooClient = Client({
    game: DragonPoo,
    board: DragonPooBoard,
    numPlayers: 4,
    multiplayer: Local(),
});

export default () => (
    <div>
        <DragonPooClient playerID="0"/>
        <DragonPooClient playerID="1"/>
        <DragonPooClient playerID="2"/>
        <DragonPooClient playerID="3"/>
    </div>
);
