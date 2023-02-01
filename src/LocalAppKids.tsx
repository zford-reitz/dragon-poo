import React from 'react';
import {Client} from 'boardgame.io/react';
import {DragonPooKids} from './Game';
import {Local} from 'boardgame.io/multiplayer';
import {SharedDragonPooBoard} from './SharedBoard';

const DragonPooClient = Client({
    game: DragonPooKids,
    board: SharedDragonPooBoard,
    numPlayers: 4,
    multiplayer: Local(),
});

const component = () => (
    <div>
        <DragonPooClient playerID="0"/>
        <DragonPooClient playerID="1"/>
        <DragonPooClient playerID="2"/>
        <DragonPooClient playerID="3"/>
    </div>
);
export default component;
