import { html, render } from "uhtml";
import { Button, Digit } from "./components";
import { preloadImage } from "./helpers/assets";

export interface MatrixState {
  isClicked: boolean;
  isBomb: boolean;
  isFlagged: boolean;
  surroundingBombs: number;
}

const images = [
  "/board/bomb-exploded.svg",
  "/board/bomb.svg",
  "/board/button.svg",
  "/board/field.svg",
  "/board/flag.svg",
  "/board/number-1.svg",
  "/board/number-2.svg",
  "/board/number-3.svg",
  "/board/number-4.svg",
  "/board/number-5.svg",
  "/board/number-6.svg",
  "/board/number-7.svg",
  "/board/number-8.svg",
  "/border/inset-thick.svg",
  "/border/inset-thin.svg",
  "/border/inset.svg",
  "/border/outset-thick.svg",
  "/border/outset-thin.svg",
  "/border/outset.svg",
  "/digit/-.svg",
  "/digit/0.svg",
  "/digit/1.svg",
  "/digit/2.svg",
  "/digit/3.svg",
  "/digit/4.svg",
  "/digit/5.svg",
  "/digit/6.svg",
  "/digit/7.svg",
  "/digit/8.svg",
  "/digit/9.svg",
  "/digit/_.svg",
  "/faces/dead.svg",
  "/faces/shock.svg",
  "/faces/smile.svg",
  "/faces/sunglasses.svg",
  "/favicon.svg",
];

images.map((url) => preloadImage(url));

class Mineswept {
  node: Element;
  width: number;
  height: number;

  matrix: MatrixState[] | undefined;

  header: HTMLElement | undefined;
  board: HTMLElement | undefined;
  grid: HTMLElement | undefined;
  timer: HTMLElement | undefined;

  bombs: number | undefined;
  time = 0;

  constructor(node: Element, width: number, height: number) {
    this.node = node;
    this.width = width;
    this.height = height;

    this.init();
  }

  initHeader() {
    const header = document.createElement("header");

    const bombs = Digit("000");

    header.appendChild(bombs);
    this.node.appendChild(header);
  }

  initBoard() {
    const board = document.createElement("section");
    board.className = "board";
    this.node.appendChild(board);
    this.board = board;
  }

  initTimer() {
    setInterval(() => {
      if (this.time > 999) return;
      this.time = this.time + 1;
      console.log("a");
    }, 1000);
  }

  revealNearby({
    index,
    width,
    size,
    matrix,
    setMatrix,
  }: {
    index: number;
    width: number;
    size: number;
    matrix: MatrixState[];
    setMatrix(val: MatrixState[]): void;
  }) {
    if (matrix[index].isClicked) return;

    const newMatrix = matrix;
    newMatrix[index].isClicked = true;
    setMatrix(newMatrix);

    if (matrix[index].surroundingBombs === 0 && !matrix[index].isBomb) {
      const numbers = [-1, 1, -width, width];
      const validNumbers = numbers.filter((x) => {
        const newIndex = index + x;
        // out of bound
        if (newIndex < 0 || newIndex + 1 > size) return;
        // start of row
        if (!(newIndex % width) && x === 1) return;
        // end of row
        if (!((newIndex + 1) % width) && x === -1) return;
        return x;
      });

      validNumbers.map((x) => {
        const newIndex = index + x;
        if (
          matrix[newIndex].surroundingBombs === 0 &&
          !matrix[newIndex].isBomb
        ) {
          this.revealNearby({
            index: index + x,
            width,
            size,
            matrix,
            setMatrix,
          });
        } else {
          const newMatrix = matrix;
          newMatrix[newIndex].isClicked = true;
          setMatrix(newMatrix);
        }
      });
    }
  }

  init() {
    this.generateGrid(this.width, this.height);
    this.initTimer();
    const app = html`
      <header>
        ${Digit("000")}
        <button type="button">
          <img src="/faces/smile.svg" />
        </button>
        <div>${this.time}</div>
        ${Digit(`${this.time ?? 0}`)}
      </header>
      <main class="board">
        <section class="grid">
          ${Array(this.height)
            .fill(0)
            .map(
              (_v, y) => html`<div>
                ${Array(this.width)
                  .fill(0)
                  .map((_v, x) => {
                    const data = this.matrix![x * this.width + y];
                    return html.for(data)`${Button({
                      dataId: y * this.width + x,
                      matrix: this.matrix!,
                      setMatrix: (matrix: MatrixState[]) => {
                        console.log("set it uwu");
                        console.log(JSON.stringify(matrix));
                        this.matrix = matrix;
                      },
                      revealNearby: ({ index }: { index: number }) =>
                        this.revealNearby({
                          index,
                          width: this.width,
                          size: this.width * this.height,
                          matrix: this.matrix!,
                          setMatrix: (matrix: MatrixState[]) =>
                            (this.matrix = matrix),
                        }),
                      ...data,
                    })}`;
                  })}
              </div>`
            )}
        </section>
        <footer>${JSON.stringify(this.matrix)}</footer>
      </main>
    `;
    render(this.node, app);
  }

  generateGrid = (width: number, height: number) => {
    const size = width * height;
    const field: MatrixState[] = Array(size).fill({
      isClicked: false,
      isBomb: false,
      surroundingBombs: 0,
    });

    const bombs = Math.round((10 / size) * size);
    this.bombs = bombs;

    // Add bombs!
    const validBombLocations = [...Array(size).keys()];
    for (var i = 0; i < bombs; i++) {
      // Get a random location.
      var pos = Math.round(Math.random() * (validBombLocations.length - 0) + 0);
      // Make it a bomb.
      field[pos] = {
        ...field[pos],
        isBomb: true,
      };
      // Remove it from valid locations so we don't duplicate.
      validBombLocations.splice(pos, 1);
    }

    // Add numbers!
    for (var n = 0; n < size; n++) {
      let fVal = field[n];
      if (fVal.isBomb === true) continue; // Ignore if bomb
      var finalNumber = 0;

      const numbers = [
        -1,
        1,
        -(width - 1),
        -width,
        -(width + 1),
        width - 1,
        width,
        width + 1,
      ];

      for (const x in numbers) {
        let num = numbers[x];
        let i = n + num;

        if (i < 0 || i > size) continue; // Exit if irrelevant
        if (
          (n + 1) % width == 0 &&
          (num == 1 || num == width + 1 || num == -(width - 1))
        )
          continue;
        if (
          n % width == 0 &&
          (num == -1 || num == -(width + 1) || num == width - 1)
        )
          continue;
        if (field[i] === undefined) continue;
        if (field[i].isBomb === true) finalNumber++;
      }

      field[n] = {
        ...field[n],
        surroundingBombs: finalNumber,
      };
    }

    this.matrix = field;
  };
}

const canvas1 = document.querySelector("#app1");

if (canvas1) {
  new Mineswept(canvas1, 9, 12);
}
