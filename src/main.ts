import { Digit, Row, Button } from './components';
import { preloadImage } from './helpers/assets';

export interface MatrixState {
  isClicked: boolean
  isBomb: boolean
  isFlagged: boolean
  surroundingBombs: number
}

const images = [
  '/board/bomb-exploded.svg',
  '/board/bomb.svg',
  '/board/button.svg',
  '/board/field.svg',
  '/board/flag.svg',
  '/board/number-1.svg',
  '/board/number-2.svg',
  '/board/number-3.svg',
  '/board/number-4.svg',
  '/board/number-5.svg',
  '/board/number-6.svg',
  '/board/number-7.svg',
  '/board/number-8.svg',
  '/border/inset-thick.svg',
  '/border/inset-thin.svg',
  '/border/inset.svg',
  '/border/outset-thick.svg',
  '/border/outset-thin.svg',
  '/border/outset.svg',
  '/digit/-.svg',
  '/digit/0.svg',
  '/digit/1.svg',
  '/digit/2.svg',
  '/digit/3.svg',
  '/digit/4.svg',
  '/digit/5.svg',
  '/digit/6.svg',
  '/digit/7.svg',
  '/digit/8.svg',
  '/digit/9.svg',
  '/digit/_.svg',
  '/faces/dead.svg',
  '/faces/shock.svg',
  '/faces/smile.svg',
  '/faces/sunglasses.svg',
  '/favicon.svg',
]

images.map((url) => preloadImage(url))

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

  constructor(node: Element, width: number, height: number) {
    this.node = node;
    this.width = width;
    this.height = height;

    this.init();
  }

  initHeader() {
    const header = document.createElement("header");

    const bombs = Digit("000");

    const status = document.createElement("button");
    status.setAttribute("type", "button");

    const statusImage = document.createElement("img");
    statusImage.setAttribute("src", "/faces/smile.svg");
    status.appendChild(statusImage);

    const timer = document.createElement("div");
    timer.className = "timer";
    this.timer = timer;

    header.appendChild(bombs);
    header.appendChild(status);
    header.appendChild(timer);
    this.node.appendChild(header);
  }

  initBoard() {
    const board = document.createElement("section");
    board.className = "board";
    this.node.appendChild(board);
    this.board = board;
  }

  initTimer() {
    let time = 0;
    this.timer!.appendChild(Digit(String(time).padStart(3, "0")));
    setInterval(() => {
      time = time + 1;
      this.timer!.innerHTML = "";
      this.timer!.appendChild(Digit(String(time).padStart(3, "0")));
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

    const newMatrix = matrix
    newMatrix[index].isClicked = true;
    setMatrix(newMatrix)

    if ( matrix[index].surroundingBombs === 0 && !(matrix[index].isBomb) ) {
      const numbers = [-1, 1, -width, width];
      const validNumbers = numbers.filter((x) => {
        const newIndex = index + x;
        // out of bound
        if (newIndex < 0 || newIndex + 1 > size) return;
        // start of row
        if (!(newIndex % width) && x === 1 ) return;
        // end of row
        if (!((newIndex + 1) % width) && x === -1) return;
        return x;
      });

      validNumbers.map((x) => {
        const newIndex = index + x;
        if ( matrix[newIndex].surroundingBombs === 0 && !(matrix[newIndex].isBomb) ) {
          this.revealNearby({ index: index + x, width, size, matrix, setMatrix });
        } else {
          const newMatrix = matrix;
          newMatrix[newIndex].isClicked = true;
          setMatrix(newMatrix);
        }
      });
    }
  }

  init() {
    this.initHeader();
    this.initBoard();
    this.initTimer();
    this.generateGrid(9, 12);
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
    this.rehydrate();
  };

  rehydrate() {
    if (this.grid === undefined) {
      const grid = document.createElement("div");
      grid.className = "grid";
      this.board?.appendChild(grid);
      this.grid = grid;
    }
    const rows = Array(this.height)
      .fill(0)
      .map((_v, rowIndex) => {
        return Row(
          Array(this.width)
            .fill(0)
            .map((_v, columnIndex) => {
              const dataId = rowIndex * this.width + columnIndex;
              const data = this.matrix![dataId];
              return Button({
                dataId: dataId,
                matrix: this.matrix!,
                setMatrix: (matrix: MatrixState[]) => (this.matrix = matrix),
                revealNearby: ({ index }: { index: number }) =>
                  this.revealNearby({
                    index,
                    width: this.width,
                    size: this.width * this.height,
                    matrix: this.matrix!,
                    setMatrix: (matrix: MatrixState[]) =>
                      (this.matrix = matrix),
                  }),
                rehydrate: () => this.rehydrate(),
                ...data,
              });
            }),
          `${rowIndex}`
        );
      });
    this.grid.innerHTML = "";
    rows.map((v) => this.grid!.appendChild(v));
  }
}

const canvas1 = document.querySelector("#app1");

if ( canvas1 ) {
  new Mineswept(canvas1, 9, 12);
}