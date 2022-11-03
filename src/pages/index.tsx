import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

// Constants
const GRID_SIZE = 6;
const TIMEOUT_SHORT = 100; // milliseconds

// Types
enum HINT {
  DOWN = -1,
  HIT,
  UP,
}

type Guess = string; // TODO: make hex type
type GuessArray = Array<Array<HINT | Guess | undefined>>;

// Predefined objects
const row = Array(GRID_SIZE).fill("");
const grid = Array(GRID_SIZE).fill(row);
const hexes = Array(16)
  .fill(0)
  .map((_, i) => i.toString(16));

// Difference between two hexadecimal numbers
const getDistance = (guess: string, answer: string) => {
  const distance = parseInt(guess, 16) - parseInt(answer, 16);
  return distance < 0 ? HINT.UP : distance == 0 ? HINT.HIT : HINT.DOWN;
};

const hexToRgb = (hex: string) => {
  const hexArray = hex.split("") as [
    string,
    string,
    string,
    string,
    string,
    string
  ];
  return {
    r: parseInt(hexArray[0] + hexArray[1] + "", 16),
    g: parseInt(hexArray[2] + hexArray[3] + "", 16),
    b: parseInt(hexArray[4] + hexArray[5] + "", 16),
  };
};

// Determine contrast color as white or black on hex code background
const getContrastColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "black" : "white";
};

interface IProps {
  hex: string;
}

/**
 * This is the main game component. It holds the title, grid, keyboard, and logic.
 * @param {string} hex the hex code of the color to be guessed
 */
const Home = ({ hex }: IProps) => {
  // Initialize guess arrays to 6x6 empty strings
  const [guesses, setGuesses] = useState<GuessArray>(
    [...Array(6)].map(() => [...Array(6)].map(() => undefined))
  );
  const [distances, setDistances] = useState<GuessArray>(
    [...Array(6)].map(() => [...Array(6)].map(() => undefined))
  );

  // The hex as a hex code string
  const color = `#${hex}`;

  // Track row, column, and pressed key
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const [keystroke, setKeystroke] = useState<string>("");

  // Contrast color
  const contrastColor = getContrastColor(hex);

  // To highlight the focused cell
  const isActive = useCallback(
    (row: number, column: number) => {
      return row === currentRow && column === currentColumn;
    },
    [currentRow, currentColumn]
  );

  // To evaluate the row when the user presses the enter key
  const handleEnter = (row: number, guesses: GuessArray) => {
    // Ensure all cells are filled
    if (guesses[row]?.some((cell) => !cell)) return;

    // Calculate distances to correct digit
    guesses[row]?.forEach((guess, column: number) => {
      setDistances((prev) => {
        prev[row]![column] = getDistance(
          guess as string,
          hex[column] as string
        ); // TODO: fix type assertions
        return prev;
      });
    });

    // Win
    if (guesses[row]?.join("") === hex) {
      alert(`You win! The hex was ${color}`);
    }

    // Lose
    if (row === GRID_SIZE - 1) {
      alert(`You lose! The hex was ${color}.`);
    }

    // Move to next row and reset column
    setCurrentRow((prev) => Math.min(prev + 1, GRID_SIZE - 1));
    setCurrentColumn(0);
  };

  // To clear the active cell when the user presses backspace
  const handleBackspace = (row: number, column: number) => {
    setGuesses((prev) => {
      prev[row]![Math.max(column, 0)] = undefined;
      return prev;
    });
    setCurrentColumn((prev) => Math.max(prev - 1, 0));
  };

  // To populate the active cell when the user presses a key 0-F
  const handleKeystroke = (row: number, column: number, key: string) => {
    if (!hexes.includes(key)) return;
    setKeystroke(key);
    setGuesses((prev) => {
      prev[row]![column] = key;
      return prev;
    });
    setCurrentColumn((prev) => Math.min(prev + 1, GRID_SIZE - 1));
  };

  // Listen for keyboard events
  useEffect(() => {
    const keyboardHandler = ({ key }: KeyboardEvent) => {
      if (!key) return;

      switch (key) {
        // Enter key: submit guess
        case "Enter":
          handleEnter(currentRow, guesses);
          break;
        // Backspace key: clear guess
        case "Backspace":
          handleBackspace(currentRow, currentColumn);
          break;
        // Arrow keys: move cursor
        case "ArrowLeft":
          setCurrentColumn((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowRight":
          if (!guesses[currentRow]?.[currentColumn]) break;
          setCurrentColumn((prev) => Math.min(prev + 1, GRID_SIZE - 1));
          break;
        // Any other key: add to guess if valid hex character
        case hexes.includes(key) ? key : "":
          handleKeystroke(currentRow, currentColumn, key);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  }, [guesses, currentRow, currentColumn]);

  // To reset the highlighted key after a moment
  useEffect(() => {
    if (keystroke) {
      setTimeout(() => {
        setKeystroke("");
      }, TIMEOUT_SHORT);
    }
  }, [keystroke]);

  return (
    <>
      <Head>
        <title>Hexle</title>
        <meta name="description" content="Guess the hex code from a color" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ backgroundColor: color }}>
        <div className="center h-screen w-screen flex-col space-y-4 p-4 p-4 sm:space-y-20">
          <div className="space-y-2 text-center">
            <h1 style={{ color: contrastColor }}>Hexle</h1>
            <h2 style={{ color: contrastColor }}>
              Guess the hex code of the color to win.
            </h2>
          </div>
          {/* Guesses grid */}
          <div className="center flex-col space-y-4">
            {grid.map((row: string[], i: number) => (
              <div key={i} className="center space-x-4">
                {row.map((_, j: number) => (
                  <div
                    key={`${i}-${j}`}
                    className={`center h-10 w-10 border-2 ${
                      contrastColor === "black"
                        ? "border-black"
                        : "border-white"
                    } font-bold`}
                    style={
                      isActive(i, j)
                        ? { color: contrastColor }
                        : distances[i]![j] === HINT.DOWN
                        ? {
                            borderLeft: 0,
                            borderRight: 0,
                            borderTop: 0,
                            color: contrastColor,
                          }
                        : distances[i]![j] === HINT.UP
                        ? {
                            borderLeft: 0,
                            borderRight: 0,
                            borderBottom: 0,
                            color: contrastColor,
                          }
                        : distances[i]![j] === HINT.HIT
                        ? { color: color, backgroundColor: contrastColor }
                        : { border: 0, color: contrastColor }
                    }
                  >
                    <span>{guesses?.[i]?.[j]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Keyboard */}
          <div className="center max-w-xl flex-wrap gap-2">
            {hexes.map((hexChar: string, i: number) => (
              <div
                key={i}
                onClick={() =>
                  handleKeystroke(currentRow, currentColumn, hexChar)
                }
                className={`keyboard px-2`}
                style={{ color: color, backgroundColor: contrastColor }}
              >
                <span>{hexChar}</span>
              </div>
            ))}
            <div
              onClick={() => handleBackspace(currentRow, currentColumn)}
              className="keyboard px-2"
              style={{ color: color, backgroundColor: contrastColor }}
            >
              ←
            </div>
            <div
              onClick={() => handleEnter(currentRow, guesses)}
              className={`keyboard px-2 bg-${contrastColor}`}
              style={{ color: color, backgroundColor: contrastColor }}
            >
              Enter
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-6 left-6 hidden cursor-pointer px-3 transition-all hover:-translate-y-1 sm:block sm:block"
          style={{ color: contrastColor }}
        >
          <a
            href="https://github.com/tedspare/hexle"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code
          </a>
        </div>
      </main>
    </>
  );
};

export default Home;

// To generate a random color
export async function getServerSideProps() {
  const hex = [...Array(GRID_SIZE)]
    .map(() => (~~(Math.random() * 16)).toString(16))
    .join("");

  return {
    props: { hex },
  };
}
