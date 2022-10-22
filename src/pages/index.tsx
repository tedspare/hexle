import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

// Constants
const GRID_SIZE = 6;
const TIMEOUT_SHORT = 100; // milliseconds

// Predefined objects
const row = Array(GRID_SIZE).fill("");
const grid = Array(GRID_SIZE).fill(row);
const hexes = Array(16)
  .fill(0)
  .map((_, i) => i.toString(16));

// Difference between two hexadecimal numbers
const getDistance = (guess: any, answer: any) => {
  const distance = parseInt(guess, 16) - parseInt(answer, 16);
  const hotColdColor =
    distance < -5
      ? "bg-blue-600/50"
      : distance < 0
      ? "bg-blue-600/30"
      : distance == 0
      ? "bg-green-600/50"
      : distance > 5
      ? "bg-red-600/50"
      : "bg-red-600/30";
  return hotColdColor;
};

type GuessArray = Array<Array<string>>;

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
    [...Array(6)].map((_) => [...Array(6)].map((_) => ""))
  );
  const [distances, setDistances] = useState<GuessArray>(
    [...Array(6)].map((_) => [...Array(6)].map((_) => ""))
  );

  // Track row, column, and pressed key
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const [keystroke, setKeystroke] = useState<string>("");

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
        prev[row]![column] = getDistance(guess, hex[column]);
        return prev;
      });
    });

    // Win
    if (guesses[row]?.join("") === hex) {
      alert(`You win! The hex was #${hex}.`);
    }

    // Lose
    if (row === GRID_SIZE - 1) {
      alert(`You lose! The hex was #${hex}.`);
    }

    // Move to next row and reset column
    setCurrentRow((prev) => Math.min(prev + 1, GRID_SIZE - 1));
    setCurrentColumn(0);
  };

  // To clear the active cell when the user presses backspace
  const handleBackspace = (row: number, column: number) => {
    setGuesses((prev) => {
      prev[row]![Math.max(column, 0)] = "";
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

      <main className="bg-black">
        <div className="center h-screen w-screen flex-col space-y-4 p-4 sm:space-y-20">
          <div className="space-y-2 text-center">
            <h1 style={{ color: `#${hex}` }}>Hexle</h1>
            <h2>Guess the color of this title to win.</h2>
            <p>Red means too high. Bright red means way too high. Etc.</p>
          </div>
          {/* Guesses grid */}
          <div className="center flex-col space-y-2">
            {grid.map((row: string[], i: number) => (
              <div key={i} className="center space-x-2">
                {row.map((_, j: number) => (
                  <div
                    key={`${i}-${j}`}
                    className={`center h-12 w-12 rounded border ${
                      isActive(i, j)
                        ? "scale-110 border-gray-400"
                        : "border-gray-600"
                    } ${distances[i]![j]} transition-transform`}
                  >
                    <span>{guesses?.[i]?.[j]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Keyboard */}
          <div className="center max-w-xl flex-wrap gap-2">
            {hexes.map((hex: string, i: number) => (
              <div
                key={i}
                onClick={() => handleKeystroke(currentRow, currentColumn, hex)}
                className={`keyboard ${
                  keystroke === hex ? "!bg-gray-500" : ""
                }`}
              >
                <span>{hex}</span>
              </div>
            ))}
            <div
              onClick={() => handleBackspace(currentRow, currentColumn)}
              className="keyboard px-2"
            >
              ←
            </div>
            <div
              onClick={() => handleEnter(currentRow, guesses)}
              className="keyboard px-2"
            >
              Enter
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 hidden px-3 text-gray-400 transition-all hover:-translate-y-1 hover:rotate-2 hover:text-gray-200 sm:block">
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
    .map((_) => (~~(Math.random() * 16)).toString(16))
    .join("");

  return {
    props: { hex },
  };
}
