import React, {CSSProperties, ReactElement} from 'react';
import {BoardProps} from 'boardgame.io/react';
import './App.css';
import {DragonDieColor, GameState} from './GameState';
import {
    canEnterBoard,
    canMoveGoblin,
    canScurryGoblin,
    DRAGON,
    findBlockingWall,
    findPlayerLocation,
    isOrthogonal,
    POO
} from './dragon-poo';
import {Card} from './Card';
import {Location} from './location';
import _ from 'lodash';
import {PlayerID} from 'boardgame.io';

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
        } else if (clicked.title === 'Bait') {
            this.setState({action: 'PlaceBait', card: clicked});
        } else if (clicked.title === 'Scurry!') {
            this.setState({action: 'Scurry', card: clicked});
        } else if (clicked.title === 'Smash Stuff!') {
            this.setState({action: 'SmashStuffFirstSpace', card: clicked});
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
                    action: 'PlaceWallSecondSpace',
                    clicks: [{row: row, column: column}]
                });
            } else if (this.state.action === 'PlaceWallSecondSpace') {
                console.log('set second wall space');
                const location1: Location = _.first(this.state.clicks)!;
                const location2: Location = {row: row, column: column};

                if (isOrthogonal(location1, location2) && !findBlockingWall(this.props.G, location1, location2)) {
                    this.props.moves.buildWall({from: location1, to: location2});
                }

                this.setState({action: undefined, card: undefined, clicks: []});
            } else if (this.state.action === 'PlaceBait') {
                this.props.moves.placeBait({row: row, column: column});
                this.setState({action: undefined, card: undefined, clicks: []});
            } else if (this.state.action === 'Scurry') {
                this.props.moves.scurry({row: row, column: column});
                this.setState({action: undefined, card: undefined, clicks: []});
            }
            if (this.state.action === 'SmashStuffFirstSpace') {
                this.setState({
                    action: 'SmashStuffSecondSpace',
                    clicks: [{row: row, column: column}]
                });
            } else if (this.state.action === 'SmashStuffSecondSpace') {
                const location1: Location = _.first(this.state.clicks)!;
                const location2: Location = {row: row, column: column};

                if (_.isEqual(location1, location2)) {
                    this.props.moves.smashStuff(location1);
                } else {
                    this.props.moves.smashStuff(location1, location2);
                }

                this.setState({action: undefined, card: undefined, clicks: []});
            }
        } else if (this.props.ctx.activePlayers && this.props.ctx.activePlayers[this.props.playerID!] === 'guideDragon') {
            this.props.moves.guideDragon({row: row, column: column});
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
        let winner: any = undefined;
        let winnerBackgroundColor: string | undefined = undefined;
        if (this.props.ctx.gameover) {
            winnerBackgroundColor = this.playerToStyleMap().get(this.props.ctx.gameover.winner);

            winner =
                this.props.ctx.gameover.winner !== undefined ? (
                    <div id="winner"><span>Winner: </span><span className={'player ' + winnerBackgroundColor}></span>
                    </div>
                ) : (
                    <div id="winner">Draw!</div>
                );
        }


        const cellStyle: CSSProperties = {
            borderTop: '1px solid #555',
            borderBottom: '1px solid #555',
            borderLeft: '1px solid #555',
            borderRight: '1px solid #555',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center'
        };

        const playerLocation = findPlayerLocation(this.props.ctx.currentPlayer, this.props.G.cells);
        const isMoving = this.props.isActive && (this.isKidGame() || (this.props.ctx.activePlayers && this.props.ctx.activePlayers[this.props.ctx.currentPlayer] === 'move'));

        let tbody = [];
        for (let i = 0; i < 5; i++) {
            let cells: JSX.Element[] = [];
            for (let j = 0; j < 5; j++) {
                const thisCellStyle = _.cloneDeep(cellStyle);
                const location = {row: i, column: j};
                this.applyWallStyles(location, thisCellStyle);

                if (this.props.playerID === this.props.ctx.currentPlayer) {
                    if (isMoving && (canMoveGoblin(this.props.G, playerLocation, location) || canEnterBoard({G: this.props.G}, this.props.playerID as PlayerID, i, j))) {
                        thisCellStyle.backgroundColor = 'pink';
                    }

                    if (this.state.action === 'Scurry' && canScurryGoblin(this.props.G, playerLocation, location)) {
                        thisCellStyle.backgroundColor = 'pink';
                    }
                }

                const id = 5 * i + j;
                let cellContents = this.convertCellContents(this.props.G.cells[i][j]);

                cells.push(
                    <td style={thisCellStyle} key={id} onClick={() => this.onClick(i, j)}
                        className={winnerBackgroundColor}>
                        {cellContents}
                    </td>
                );
            }
            tbody.push(<tr key={i}>{cells}</tr>);
        }

        let pooCounts = [];
        for (let playerId in this.props.G.pooCount) {
            pooCounts.push(
                <div><span
                    className={this.playerToStyleMap().get(playerId)}>Poo</span>: {this.props.G.pooCount[playerId]}
                </div>
            );
        }

        const piecesOnBoard = this.props.G.cells.flat(Infinity);

        let cancelButton = undefined;
        if (this.state.action) {
            cancelButton =
                <button id="cancel" type="button" onClick={() => this.cancelAction()}>Cancel current action</button>;
        }

        let guideDragonHint = undefined;
        if (this.props.ctx.activePlayers && this.props.ctx.activePlayers[this.props.playerID!] === 'guideDragon') {
            guideDragonHint =
                <div id="guide-dragon-hint">Help the Dragon decide which way to go toward the bait...</div>;
        }

        let playerHand = this.props.G.players[this.props.playerID!].hand
            .map((card, idx) => <button key={idx} type="button"
                                        onClick={() => this.onCardClick(card)}>{card.title}</button>);

        return (
            <div>
                <div className="grid">
                    <div className="start-zone-1">{piecesOnBoard.includes('0') ? '' :
                        <span className="player player-orange"></span>}</div>
                    <div className="start-zone-2">{piecesOnBoard.includes('1') ? '' :
                        <span className="player player-blue"></span>}</div>
                    <div className="center">
                        <table id="board">
                            <tbody>{tbody}</tbody>
                        </table>
                    </div>
                    <div className="start-zone-3">{piecesOnBoard.includes('2') ? '' :
                        <span className="player player-green"></span>}</div>
                    <div className="start-zone-4">{piecesOnBoard.includes('3') ? '' :
                        <span className="player player-white"></span>}</div>
                </div>
                {!this.isKidGame() && <div className="deck">Deck (cards remaining): {this.props.G.deck?.length}</div>}
                {this.dragonDie(this.props.G.dragonDieRoll)}
                {!this.isKidGame() &&
                    <div className="player-hand">Player hand ({this.props.ctx.currentPlayer}): {playerHand}</div>}
                {pooCounts}
                {cancelButton}
                {guideDragonHint}
                {winner}
                <br/>
                <br/>
                Dragon Icon by Di (they-them) - Own work, CC BY-SA 4.0,
                https://commons.wikimedia.org/w/index.php?curid=99403224<br/>
                Poo Icon by OpenMoji, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=69428124<br/>
            </div>
        );
    }

    private isKidGame() {
        return this.props.G.deck.length === 0;
    }

    private dragonDie(currentColor: DragonDieColor) {
        return <div className="dragon-die">Dragon Die roll: {currentColor}</div>;
    }

    private convertCellContents(textualContents: string[]): ReactElement[] {
        let cellContents: ReactElement[] = [];

        if (textualContents.includes('Dragon')) {
            cellContents.push(<img src="icons/dragon.svg" width="50px" alt="dragon"></img>);
        }

        _.times(
            _.countBy(textualContents, e => e === POO).true,
            () => cellContents.push(<img src="icons/poo.svg" width="20px" alt="poo"></img>)
        )

        const playerToStyleMap = this.playerToStyleMap();
        for (let token of textualContents) {
            if (playerToStyleMap.has(token)) {
                cellContents.push(<span className={"player " + playerToStyleMap.get(token)}></span>);
            }
        }

        const unhandledContents = _(textualContents)
            .without(DRAGON, POO)
            .without(...playerToStyleMap.keys())
            .join();

        cellContents.push(<span>{unhandledContents}</span>);

        return cellContents;
    }

    private playerToStyleMap(): Map<string, string> {
        const map = new Map<string, string>();
        map.set('0', 'player-orange');
        map.set('1', 'player-blue');
        map.set('2', 'player-green');
        map.set('3', 'player-white');
        return map;
    }
}