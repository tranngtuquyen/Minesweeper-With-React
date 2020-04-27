import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render() {
    return(
      <div>
        <button className="square" disabled={this.props.disable} onClick={(e) => this.props.onClick(this.props.index, e)} onContextMenu={(e) => this.props.onContextMenu(this.props.index,e)}>{this.props.value}</button>
      </div>
    );
  }
}
//create a random set of bomb index array within the size of boardsize
function BombCreate (size, bombNumber) {
  let i = 0;
  let bombArr = [];
  while (i < bombNumber) {
    let added = false;
    while (added === false) {
      let randomNumber = Math.floor(Math.random() * size);
      if (bombArr.indexOf(randomNumber) === -1) {
        bombArr.push(randomNumber);
        added = true;
      } 
    }
    i++;
  }
  return bombArr;
}

function FindAdjacent (i, arr) {
  let adjacent = [];
  let size = Math.sqrt(arr.length);
  if (i % size === 0) {
    adjacent = [
      i + 1, 
      i + size, i - size,
      i + size + 1,
      i - size + 1
    ];
  } else if ((i + 1) % size === 0) {
    adjacent = [
      i - 1, 
      i + size, i - size,
      i + size - 1,
      i - size - 1
    ];
  } else {
    adjacent = [
      i + 1, i - 1, 
      i + size, i - size,
      i + size + 1, i + size - 1,
      i - size + 1, i - size - 1
    ];
  }

  let result = adjacent.filter((index) => {return index >= 0 && index < arr.length});
  return result;
}

function FindAllZeroAdjacent (i, baseArr) {
  let queue = [];
  let arr = [i];

  while (arr.length > 0) {
    var first = arr.shift();

    if (baseArr[first] === 0) {
      var indexArr = FindAdjacent(first, baseArr)
                    .filter((index) => {return arr.indexOf(index) === -1 && queue.indexOf(index) === -1});
      arr = arr.concat(indexArr);
    }
    if (queue.indexOf(first) === -1) {
      queue.push(first);
    }
  }
  return queue;
}

function ReplaceValue (arr, i, baseArr) {
  let allAdjacent = FindAllZeroAdjacent(i, baseArr);
  for (var j = 0; j < allAdjacent.length; j++) {
    var index = allAdjacent[j];
    if (arr[index] !== '?') {
      arr[index] = baseArr[index];
    }
  }
}

function SquareCal (arr) {
  return arr.map(((a, i) => {
    if (a !== 'X') {
      
      let adjacent = FindAdjacent(i, arr);
      
      let count = adjacent.filter((index) => {return arr[index] === 'X'}).length;
      return count;
    }
    return a;
  }));
}

function TrueBoard (boardSize, bombNumber) {
  const squaresNumber = boardSize * boardSize;
  const bomb = BombCreate(squaresNumber, bombNumber);
  let arr = Array(squaresNumber).fill(null);
  for (let i = 0; i < bomb.length; i++) {
    let index = bomb[i];
    arr[index] = 'X'; 
  }
  arr = SquareCal(arr);
  return arr;
}

class Board extends React.Component {
  renderSquare() {
    const size = this.props.boardSize;
    const squaresNumber = size * size;
    let arr = this.props.board.slice();
    let i = 0;
    let squares = [];
    let row = [];
    while (i < squaresNumber) {
      if (row.length < size) {
        row.push(<Square key={i} value={arr[i]} index={i} disable={this.props.disable} onClick={this.props.onClick.bind(this)} onContextMenu={this.props.onContextMenu.bind(this)}/>);
      } else {
        squares.push(<div key={i} className='board'>{row}</div>);
        row = [];
        row.push(<Square key={i} value={arr[i]} index={i} disable={this.props.disable} onClick={this.props.onClick.bind(this)} onContextMenu={this.props.onContextMenu.bind(this)}/>);
      }
      i++;
    }
    squares.push(<div key={i} className='board'>{row}</div>);
    return squares;
  }
  render() {
    const squares = this.renderSquare();
    return(
      <div>
        {squares}
      </div>
    );
  }
}

function WinnerCal (ar, baseArr) {
  let arr = ar.slice();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '?') {
      arr[i] = 'X';
    }
    if (arr[i] !== baseArr[i]) {
      return false;
    }
  }
  return true;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    var size = 9;
    var bomb = 10;
    this.state = {
      boardSize: size,
      bombNumber: bomb,
      trueBoard: TrueBoard(size, bomb),
      playBoard: Array(size * size).fill(null),
      gameOver: false, 
      bombCount: bomb,
      second: 0,
      minute: 0, 
      winningHistory: [{timer: null, minute: null, second: null}],
      disable: true,
      win: false
    };
  }

  chooseSize = (name) => {
    if (name === 'medium') {
      this.setState({boardSize: 16, bombNumber: 40});
    } else if (name === 'hard') {
      this.setState({boardSize: 24, bombNumber: 80});
    } else {
      this.setState({boardSize: 9, bombNumber: 10});
    }
    this.newGame();
  }

  setDefaultState = () => {
    this.setState((state) => ({
      playBoard: Array(state.boardSize * state.boardSize).fill(null),
      gameOver: false, 
      bombCount: state.bombNumber,
      second: 0,
      minute: 0, 
      disable: true,
      win: false})
    );
  }

  newGame = () => {
    this.stopTimer();
    this.setState((state) => ({
      trueBoard: TrueBoard(state.boardSize, state.bombNumber),
      })
    );
    this.setDefaultState();
  }

  resetGame = () => {
    this.stopTimer();
    this.setState((state) => ({
      trueBoard: state.trueBoard,
      })
    );
    this.setDefaultState();
  }

  handleWinner = (arr) => {
    var isWinner = WinnerCal(arr, this.state.trueBoard);
    if (isWinner) {
      let sec = this.state.second;
      let min = this.state.minute;
      let timer = min * 60 + sec;
      let record = {timer: timer, minute: min, second: sec};
      let history = this.state.winningHistory.slice();
      history.push(record);
      this.setState({winningHistory: history, disable: true, win: true});
      this.stopTimer();
    }
  }

  handleClick = (i,event) => {
    
    if (this.state.gameOver) {
      return;
    }
    
    const trueBoard = this.state.trueBoard;
    
    let arr = this.state.playBoard.slice();
    if (arr[i] === '?') {
      this.setState((state) => ({bombCount: state.bombCount + 1}));
    }
    arr[i] = trueBoard[i];
    if (arr[i] === 'X') {
      this.setState({gameOver: true, disable: true});
      this.stopTimer();
    } else if (arr[i] === 0) {
      ReplaceValue(arr, i, trueBoard);
    }
    this.setState((state) => ({playBoard: arr}));
    this.handleWinner(arr);
  }

  handleRightClick = (i, event) => {
    event.preventDefault();
    if (this.state.gameOver) {
      return;
    }
    let arr = this.state.playBoard.slice();
    arr[i] = '?';
    this.setState((state, props) => ({bombCount: state.bombCount - 1, playBoard: arr}));
    this.handleWinner(arr);
  }

  
  tick = () => {
    let sec = this.state.second + 1;
    let min = this.state.minute;
    if (sec === 60) {
      min += 1;
      sec = 0;
    } 
    this.setState((state) => ({second: sec, minute: min}));
  }

  stopTimer = () => {
    clearInterval(this.timerID);
  }

  startGame = () => {
    if (this.state.win || this.state.gameOver) {
      this.resetGame();
    }
    
    clearInterval(this.timerID);
    this.timerID = setInterval(
      () => this.tick(), 1000
    );
    this.setState((state) => ({disable: false}));
  }

  render() {
    let status = '';
    if (this.state.win) {
      status = 'You Win!!!!';
    }

    if (this.state.gameOver) {
      status = 'Game Over';
    }

    let winningHistory = this.state.winningHistory.slice();
    let history = winningHistory.map((record) => {
      const min = record.minute;
      const sec = record.second;
      const timer = record.timer;
      if (timer !== null) {
        return (
          <li>
            {min}:{sec}
          </li>
        );
      }
    });

    return(
      <div className='game'>
        <div className="menu">
          <button onClick={this.chooseSize.bind(this,'easy')}>Easy 9x9</button>
          <button onClick={this.chooseSize.bind(this,'medium')}>Medium 16x16</button>
          <button onClick={this.chooseSize.bind(this,'hard')}>Hard 24x24</button>
        </div>

        <button onClick={this.startGame} className='startGame'>Start</button>
        
        <div className='bombCount'>
          Bomb count: {this.state.bombCount}

        </div>
        <Board boardSize={this.state.boardSize} bombNumber={this.state.bombNumber} 
          onClick={(i,e) => this.handleClick(i,e)} 
          onContextMenu={(i,e) => this.handleRightClick(i,e)}
          board={this.state.playBoard} disable={this.state.disable}
        />
        <div>
          Timer: {this.state.minute}:{this.state.second}
        </div>
        <div>
          {status}
        </div>

        <button className='newGame' onClick={this.newGame}>New Game</button>
        <button className='resetGame' onClick={this.resetGame}>Reset Game</button>
        
        <div>
          <p>Winning History</p>
          <ol className='history'>
            {history}
          </ol>
        </div>
    </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));