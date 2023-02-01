import React from 'react';
import {Lobby} from 'boardgame.io/react';
import {DragonPoo, DragonPooKids} from './Game';
import {DragonPooBoard} from './Board';

const {protocol, hostname, port} = window.location;
const server = `${protocol}//${hostname}:${port}`;
const importedGames = [
    {game: DragonPooKids, board: DragonPooBoard},
    {game: DragonPoo, board: DragonPooBoard}
];

let lobby = () => (
    <div>
        <h1>Lobby</h1>
        <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames}/>
    </div>
);
export default lobby;
