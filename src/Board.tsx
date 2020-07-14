import React from 'react';
import { BoardProps } from 'boardgame.io';
import './App.css';

export class DragonPooBoard extends React.Component<BoardProps> {
  render() {
    const cellStyle = {
      border: '1px solid #555',
      width: '50px',
      height: '50px',
      lineHeight: '50px',
    };

    let tbody = [];
    for (let i = 0; i < 5; i++) {
      let cells: JSX.Element[] = [];
      for (let j = 0; j < 5; j++) {
        const id = 5 * i + j;
        cells.push(
          <td style={cellStyle} key={id}>
            {this.props.G.cells[i][j]}
          </td>
        );
      }
      tbody.push(<tr key={i}>{cells}</tr>);
    }

    return (
      <div className="grid">
        <div className="start-zone-1"></div>        
        <div className="start-zone-2"></div>        
        <div className="center">
          <table id="board">
            <tbody>{tbody}</tbody>
          </table>
        </div>
        <div className="start-zone-3"></div>        
        <div className="start-zone-4"></div>        
      </div>
    );
  }
}