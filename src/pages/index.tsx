import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const hexes = Array(16)
  .fill(0)
  .map((_, i) => i.toString(16));

const row = Array(6).fill("");
const grid = Array(6).fill(row);

const keyClass =
  "center h-16 w-12 rounded bg-gray-700 transition-transform hover:scale-110 hover:bg-gray-600";

interface IProps {
  hex: string;
}

type GuessArray = Array<Array<string>>;

const Home = ({ hex }: IProps) => {
  // Initialize guess array to 6x6 empty strings
  const [guesses, setGuesses] = useState<GuessArray>(
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

  const handleEnter = (row: number, column: number, guesses: GuessArray) => {
    if (column === 5 && !!guesses[row]?.[column]) {
      if (guesses[row]?.join("") === hex) {
        alert("You win!");
      }
      if (row === 5) {
        alert("You lose!");
      }
      setCurrentRow((prev) => prev + 1);
      setCurrentColumn(0);
    }
  };

  const handleBackspace = (row: number, column: number) => {
    setCurrentColumn((prev) => Math.max(prev - 1, 0));
    setGuesses((prev) => {
      prev[row]![Math.max(column - 1, 0)] = "";
      return prev;
    });
  };

  const handleKeystroke = (row: number, column: number, key: string) => {
    if (!hexes.includes(key)) return;
    setKeystroke(key);
    setGuesses((prev) => {
      prev[row]![column] = key;
      return prev;
    });
    setCurrentColumn((prev) => Math.min(prev + 1, 5));
  };

  useEffect(() => {
    // Enter key: submit guess
    // Backspace key: delete guess
    // Arrow keys: move cursor
    // Any other key: add to guess if valid hex character
    const keyboardHandler = ({ key }: KeyboardEvent) => {
      if (!key) return;

      switch (key) {
        case "Enter":
          handleEnter(currentRow, currentColumn, guesses);
          break;
        case "Backspace":
          handleBackspace(currentRow, currentColumn);
          break;
        case "ArrowLeft":
          setCurrentColumn((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowRight":
          if (!guesses[currentRow]?.[currentColumn]) break;
          setCurrentColumn((prev) => Math.min(prev + 1, 5));
          break;
        case hexes.includes(key) ? key : "":
          handleKeystroke(currentRow, currentColumn, key);
          break;
        default:
          break;
      }
    };

    // Listen to keystrokes for 0-F characters
    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  }, [guesses, currentRow, currentColumn]);

  // To reset the highlighted key after a moment
  useEffect(() => {
    if (keystroke) {
      setTimeout(() => {
        setKeystroke("");
      }, 100);
    }
  }, [keystroke]);

  return (
    <>
      <Head>
        <title>Hexle</title>
        <meta name="description" content="Guess the hex code from a colour" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ background: `#${hex}` }}>
        <div className="center h-screen w-screen flex-col space-y-16 p-4">
          <h1 className="text-5xl font-bold">Hexle</h1>
          {/* Guesses grid */}
          <div className="center flex-col space-y-2">
            {grid.map((rowA: string[], i: number) => (
              <div key={i} className="center space-x-2">
                {rowA.map((_, j: number) => (
                  <div
                    key={`${i}-${j}`}
                    className={`center h-12 w-12 rounded border ${
                      isActive(i, j) ? "border-green-600" : "border-gray-600"
                    }`}
                  >
                    <span>{guesses?.[i]?.[j]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Keyboard */}
          <div className="center max-w-xl flex-wrap gap-2">
            {hexes.map((hex: string, i) => (
              <div
                key={i}
                onClick={() => handleKeystroke(currentRow, currentColumn, hex)}
                className={`${keyClass} ${
                  keystroke === hex ? "!bg-gray-500" : ""
                }`}
              >
                <span>{hex}</span>
              </div>
            ))}
            <div
              onClick={() => handleBackspace(currentRow, currentColumn)}
              className={`${keyClass} px-2`}
            >
              ←
            </div>
            <div
              onClick={() => handleEnter(currentRow, currentColumn, guesses)}
              className={`${keyClass} px-2`}
            >
              Enter
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

// To generate a random color
export async function getServerSideProps() {
  const hex = [...Array(6)]
    .map((_) => (~~(Math.random() * 16)).toString(16))
    .join("");

  return {
    props: { hex },
  };
}
