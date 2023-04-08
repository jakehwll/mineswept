import './style.css'

const Digit = (digits: string) => {
  const el = document.createElement("div");
  el.className = "digit"

  digits.split("").map((v) => {digits.split("");
    const el2 = document.createElement("img");
    el2.setAttribute('src', `/digit/${v}.svg`)
    el.appendChild(el2);
  });

  return el
}

const Button = ({
  dataId,
  rehydrate,
  revealNearby,
  matrix,
  setMatrix,
  clicked,
  bomb,
  surrounds,
}: {
  dataId: number;
  rehydrate(): void;
  revealNearby({ index }: { index: number; }): void;
  matrix: MatrixState[];
  setMatrix(val: MatrixState[]): void;
  clicked: boolean;
  bomb: boolean;
  surrounds: number;
}) => {
  const el = document.createElement("button");
  el.className = [""].join(" ");
  el.innerHTML = `${dataId}`

  el.setAttribute("data-id", `${dataId}`);
  el.setAttribute("data-surround", `${surrounds}`);

  if (bomb) el.className = ["bomb", ...el.className.split(" ")].join(" ");
  if (clicked) el.className = ["active", ...el.className.split(" ")].join(" ");

  el.addEventListener("click", () => {
    if (clicked) return;

    let newMatrix = matrix;

    if (bomb) {
      var loseSound = new Audio("/audio/lose.wav");
      loseSound.play();
      document.querySelectorAll(".bomb").forEach((el) => {
        el.className = ["active", ...el.className.split(" ")].join(" ");
      });
      newMatrix = newMatrix.map((v) => {
        if (v.bomb) {
          console.log(v);
        }
        return {
          ...v,
          clicked: v.bomb ? true : v.clicked,
        };
      });
      console;
    } else {
      var tickSound = new Audio("/audio/tick.wav");
      tickSound.play();
    }

    // if ( surrounds !== 0 ) {
    //   newMatrix[dataId].clicked = true;
    //   setMatrix(newMatrix);
    // } else {
      revealNearby({ index: dataId });
    // }

    rehydrate();
  });

  return el;
};

const Row = (children: HTMLElement[], id: string) => {
  const el = document.createElement("div");
  el.id = `row-${id}`;
  children.map((v) => el.appendChild(v));
  return el;
};

interface MatrixState {
  clicked: boolean
  bomb: boolean
  surrounds: number
}

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
    if (matrix[index].clicked) return;

    const newMatrix = matrix
    newMatrix[index].clicked = true;
    setMatrix(newMatrix)

    if ( matrix[index].surrounds === 0 && !(matrix[index].bomb) ) {
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
        if ( matrix[newIndex].surrounds === 0 && !(matrix[newIndex].bomb) ) {
          this.revealNearby({ index: index + x, width, size, matrix, setMatrix });
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
      clicked: false,
      bomb: false,
      surrounds: 0,
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
        bomb: true,
      };
      // Remove it from valid locations so we don't duplicate.
      validBombLocations.splice(pos, 1);
    }

    // Add numbers!
    for (var n = 0; n < size; n++) {
      let fVal = field[n];
      if (fVal.bomb === true) continue; // Ignore if bomb
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
        if (field[i].bomb === true) finalNumber++;
      }

      field[n] = {
        ...field[n],
        surrounds: finalNumber,
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
// const canvas2 = document.querySelector("#app2");

if ( canvas1 ) {
  new Mineswept(canvas1, 9, 12);
}