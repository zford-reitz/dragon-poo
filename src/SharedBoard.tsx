import React from 'react';
import './App.css';
import {DragonPooBoard} from './Board';

export class SharedDragonPooBoard extends DragonPooBoard {
    render() {
        if (!this.props.isActive && !(this.props.ctx.gameover && this.props.ctx.gameover.winner === this.props.playerID)) {
            return (<span/>);
        }

        return super.render();

    }
}