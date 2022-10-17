import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

type SquareType = string | null;
type SquaresType = Array<SquareType>;
type HandType = {
    row: number;
    col: number;
    turn: string;
};
type HistoryType = Array<{ squares: SquaresType; hand: HandType | null }>;

type SquareProps = {
    value: SquareType;
    onClick: () => void;
    isWin: boolean;
};
function Square(props: SquareProps) {
    return (
        <button className={props.isWin ? "square winSquare" : "square"} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

type BoardProps = {
    squares: SquaresType;
    onClick: (i: number) => void;
    winLine: Array<number> | null;
};
class Board extends React.Component<BoardProps> {
    renderSquare(i: number) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isWin={this.props.winLine?.includes(i) ?? false}
            />
        );
    }

    render() {
        return (
            <div>
                {[0, 1, 2].map((i) => {
                    return (
                        <div className="board-row">
                            {[0, 1, 2].map((j) => {
                                return this.renderSquare(i * 3 + j);
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }
}

type MoveProps = {
    history: HistoryType;
    jumpTo: (i: number) => void;
    pushedMoveIdx: number | null;
};

function Move(props: MoveProps) {
    const [isDesc, setIsDesc] = React.useState(false);
    const historyElementArray = props.history.map((step, move) => {
        const desc = move ? "Go to move #" + move : "Go to game start";
        let rowANDcol = null;
        if (step.hand !== null) {
            rowANDcol = (
                <p>
                    {step.hand.turn}: {step.hand.row}, {step.hand.col}
                </p>
            );
        }

        return (
            <li
                key={move}
                className={props.pushedMoveIdx === move ? "clicked" : ""}
            >
                <div>
                    <button onClick={() => props.jumpTo(move)}>{desc}</button>
                    {rowANDcol}
                </div>
            </li>
        );
    });

    if (isDesc) {
        historyElementArray.reverse();
    }

    return (
        <div>
            <button onClick={() => setIsDesc(!isDesc)}>sort</button>
            <ol reversed={isDesc}>{historyElementArray}</ol>
        </div>
    );
}

type GameState = {
    history: HistoryType;
    stepNumber: number;
    xIsNext: boolean;
    pushedMoveIdx: number | null;
};
class Game extends React.Component<{}, GameState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    hand: null,
                },
            ],
            stepNumber: 0,
            xIsNext: true,
            pushedMoveIdx: null,
        };
    }

    handleClick(i: number) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        const nowTurn = this.state.xIsNext ? "X" : "O";
        squares[i] = nowTurn;

        const row = Math.floor(i / 3);
        const col = i % 3;
        const hand = { row: row, col: col, turn: nowTurn };

        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    hand: hand,
                },
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            pushedMoveIdx: null,
        });
    }

    jumpTo(step: number) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0,
            pushedMoveIdx: step,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winLine = calculateWinner(current.squares);

        let status;
        if (winLine) {
            const winner = current.squares[winLine[0]];
            status = "Winner: " + winner;
        } else if(!current.squares.includes(null)){
            status = "Draw";
        }else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winLine={winLine}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <Move
                        history={history}
                        jumpTo={(i) => this.jumpTo(i)}
                        pushedMoveIdx={this.state.pushedMoveIdx}
                    />
                </div>
            </div>
        );
    }
}

function calculateWinner(squares: SquaresType) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return lines[i];
        }
    }
    return null;
}

// ========================================

const rootElement = document.getElementById("root");
if (rootElement !== null) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Game />);
}
