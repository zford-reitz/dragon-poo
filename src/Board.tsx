import React, { CSSProperties } from 'react';
import { BoardProps } from 'boardgame.io/react';
import './App.css';
import { GameState } from './GameState';
import { findPlayerLocation, isOrthogonal, findBlockingWall, canMoveGoblin, canEnterBoard } from './dragon-poo';
import { Card } from './Card';
import { Location } from './location';
import _ from 'lodash';

interface ClientState {
  action?: string;
  card?: Card;
  clicks: Location[];
}

export class DragonPooBoard extends React.Component<BoardProps<GameState>, ClientState> {

  constructor(props: BoardProps<GameState>) {
    super(props);

    this.state = {
      action: undefined,
      card: undefined,
      clicks: []
    };
  }

  onCardClick(clicked: Card) {
    if (clicked.title === 'Walls') {
      this.setState({action: 'PlaceWallFirstSpace', card: clicked});
      console.log('setting up placing a wall');
    } else {
      this.props.moves.playCard(clicked);
    }
  }

  cancelAction(): void {
    this.setState({action: undefined, card: undefined});
  }

  onClick(row: number, column: number) {
    if (this.state.action) {
      if (this.state.action === 'PlaceWallFirstSpace') {
        console.log('set first wall space');
        this.setState({
          action:'PlaceWallSecondSpace',
          clicks: [{row: row, column: column}]
        });
      } else if (this.state.action === 'PlaceWallSecondSpace') {
        console.log('set second wall space');
        const location1: Location = _.first(this.state.clicks)!;
        const location2: Location = {row: row, column: column};

        if (isOrthogonal(location1, location2) && !findBlockingWall(this.props.G, location1, location2)) {
          this.props.moves.playCard(this.state.card!, {from: location1, to: location2});
        }

        this.setState({action: undefined, card: undefined, clicks: []});
      }

    } else {
      const playerLocation = findPlayerLocation(this.props.ctx.currentPlayer, this.props.G.cells);
  
      if (playerLocation) {
        this.props.moves.moveGoblin({row: row, column: column});
      } else {
        this.props.moves.enterBoard(row, column);
      }
    }
  }

  applyWallStyles(location: Location, css: CSSProperties) {
    const wallStyle = '3px solid #555';
    for (let wall of this.props.G.walls) {
      let walledOff: Location | undefined = undefined;
      if (_.isEqual(location, wall.from)) {
        walledOff = wall.to;
      } else if (_.isEqual(location, wall.to)) {
        walledOff = wall.from;
      }

      if (walledOff) {
        if (location.row < walledOff.row) {
          css.borderBottom = wallStyle;
        } else if (walledOff.row < location.row) {
          css.borderTop = wallStyle;
        } else if (location.column < walledOff.column) {
          css.borderRight = wallStyle;
        } else if (walledOff.column < location.column) {
          css.borderLeft = wallStyle;
        }
      }
    }
  }

  render() {
    const cellStyle: CSSProperties = {
      borderTop: '1px solid #555',
      borderBottom: '1px solid #555',
      borderLeft: '1px solid #555',
      borderRight: '1px solid #555',
      width: '50px',
      height: '50px',
      lineHeight: '50px'
    };

    const playerLocation = findPlayerLocation(this.props.ctx.currentPlayer, this.props.G.cells);
    const isMoving = this.props.isActive && (this.props.ctx.activePlayers && this.props.ctx.activePlayers[this.props.ctx.currentPlayer] === 'move' || this.props.G.deck.length === 0);

    let tbody = [];
    for (let i = 0; i < 5; i++) {
      let cells: JSX.Element[] = [];
      for (let j = 0; j < 5; j++) {
        const thisCellStyle = _.cloneDeep(cellStyle);
        this.applyWallStyles({row: i, column: j}, thisCellStyle);

        if (isMoving && (canMoveGoblin(this.props.G, playerLocation, {row: i, column: j}) || canEnterBoard(this.props.G, this.props.ctx, i, j))) {
          thisCellStyle.backgroundColor = 'pink';
        }

        const id = 5 * i + j;
        let cellContents = [];
        if (this.props.G.cells[i][j].includes('Dragon')) {
          cellContents.push(<img src="icons/dragon.svg" width="50px"></img>);
        }

        for (let p of _.filter(this.props.G.cells[i][j], e => e === 'P')) {
          cellContents.push(<img src="icons/poo.svg" width="20px"></img>);
        }

        cells.push(
          <td style={thisCellStyle} key={id} onClick={() => this.onClick(i, j)}>
            {cellContents}
            <span>{_(this.props.G.cells[i][j]).without('Dragon').without('P').join()}</span>
          </td>
        );
      }
      tbody.push(<tr key={i}>{cells}</tr>);
    }

    let pooCounts = [];
    for (let playerId in this.props.G.players) {
      pooCounts.push(
        <div>Player {playerId} poo: {this.props.G.players[playerId].poo}</div>
      );
    }

    const piecesOnBoard = this.props.G.cells.flat(Infinity);

    let winner: any = undefined;
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    let cancelButton = undefined;
    if (this.state.action) {
      cancelButton = <button id="cancel" type="button" onClick={() => this.cancelAction()}>Cancel current action</button>;
    }

    let playerHand = this.props.G.players[this.props.ctx.currentPlayer].hand
      .map((card, idx) => <button key={idx} type="button" onClick={() => this.onCardClick(card)}>{card.title}</button>);

    return (
      <div>
        <div className="grid">
          <div className="start-zone-1">{piecesOnBoard.includes('0') ? '' : '0'}</div>
          <div className="start-zone-2">{piecesOnBoard.includes('1') ? '' : '1'}</div>
          <div className="center">
            <table id="board">
              <tbody>{tbody}</tbody>
            </table>
          </div>
          <div className="start-zone-3">{piecesOnBoard.includes('2') ? '' : '2'}</div>
          <div className="start-zone-4">{piecesOnBoard.includes('3') ? '' : '3'}</div>
        </div>
        <div className="deck">Deck (cards remaining): {this.props.G.deck?.length}</div>
        <div className="dragon-die">Dragon Die roll: {this.props.G.dragonDieRoll}</div>
        <div className="player-hand">Player hand ({this.props.ctx.currentPlayer}): {playerHand}</div>
        {pooCounts}
        {cancelButton}
        {winner}
        <br/>
        <br/>
        Dragon Icon by Di (they-them) - Own work, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=99403224<br/>
        Poo Icon by OpenMoji, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=69428124<br/>
      </div>
    );
  }

}