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
        <button
            className={props.isWin ? "square winSquare" : "square"}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

type BoardProps = {
    squares: SquaresType;
    onClick: (i: number) => void;
    winLine: Array<number> | null;
};
function Board(props: BoardProps) {
    const renderSquare = (i: number) => {
        return (
            <Square
                value={props.squares[i]}
                onClick={() => props.onClick(i)}
                isWin={props.winLine?.includes(i) ?? false}
            />
        );
    };

    return (
        <div>
            {[0, 1, 2].map((i) => {
                return (
                    <div className="board-row">
                        {[0, 1, 2].map((j) => {
                            return renderSquare(i * 3 + j);
                        })}
                    </div>
                );
            })}
        </div>
    );
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

function Game() {
    const [history, setHistory] = React.useState<HistoryType>([
        {
            squares: Array(9).fill(null),
            hand: null,
        },
    ]);
    const [stepNumber, setStepNumber] = React.useState(0);
    const [xIsNext, setXIsNext] = React.useState(true);
    const [pushedMoveIdx, setPushedMoveIdx] = React.useState<number | null>(
        null
    );

    const handleClick = (i: number) => {
        const historyCopy = history.slice(0, stepNumber + 1);
        const current = historyCopy[historyCopy.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        const nowTurn = xIsNext ? "X" : "O";
        squares[i] = nowTurn;

        const row = Math.floor(i / 3);
        const col = i % 3;
        const hand = { row: row, col: col, turn: nowTurn };

        setHistory(
            historyCopy.concat([
                {
                    squares: squares,
                    hand: hand,
                },
            ])
        );
        setStepNumber(historyCopy.length);
        setXIsNext(!xIsNext);
        setPushedMoveIdx(null);
    };

    const jumpTo = (step: number) => {
        setStepNumber(step);
        setXIsNext(step % 2 === 0);
        setPushedMoveIdx(step);
    };

    const historyCopy = history;
    const current = historyCopy[stepNumber];
    const winLine = calculateWinner(current.squares);

    let status;
    if (winLine) {
        const winner = current.squares[winLine[0]];
        status = "Winner: " + winner;
    } else if (!current.squares.includes(null)) {
        status = "Draw";
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    onClick={(i) => handleClick(i)}
                    winLine={winLine}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <Move
                    history={history}
                    jumpTo={(i) => jumpTo(i)}
                    pushedMoveIdx={pushedMoveIdx}
                />
            </div>
        </div>
    );
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
