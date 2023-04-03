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
  bomb,
  surrounds,
}: {
  dataId: string;
  bomb: boolean;
  surrounds: number;
}) => {
  const el = document.createElement("button");
  el.className = [""].join(" ");
  el.setAttribute("data-id", dataId);
  el.setAttribute("data-surround", `${surrounds}`);

  if (bomb) {
    el.className = ["bomb", ...el.className.split(" ")].join(" ");
  }

  el.addEventListener("click", () => {
    if (el.classList.contains("active")) return;
    el.className = ["active", ...el.className.split(" ")].join(" ");

    if (bomb) {
      var loseSound = new Audio("/audio/lose.wav");
      loseSound.play();
      document.querySelectorAll(".bomb").forEach((el) => {
        el.className = ["active", ...el.className.split(" ")].join(" ");
      });
    } else {
      var tickSound = new Audio("/audio/tick.wav");
      tickSound.play();
    }
  });

  return el;
};

const Row = (children: HTMLElement[], id: string) => {
  const el = document.createElement("div");
  el.id = `row-${id}`;
  children.map((v) => el.appendChild(v));
  return el;
};

class Mineswept {
  node: Element;
  width: number;
  height: number;

  matrix: number[] | undefined

  header: HTMLElement | undefined;
  board: HTMLElement | undefined;
  grid: HTMLElement | undefined;
  timer: HTMLElement | undefined;

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
    this.timer = timer

    header.appendChild(bombs);
    header.appendChild(status);
    header.appendChild(timer);
    this.node.appendChild(header);
  }

  initBoard() {
    const board = document.createElement("section");
    board.className = "board";
    this.node.appendChild(board);
    this.board = board
  }

  initTimer() {
    let time = 0;
    this.timer!.appendChild(Digit(String(time).padStart(3, "0")));
    setInterval(() => {
      time = time + 1;
      this.timer!.innerHTML = ""
      this.timer!.appendChild(Digit(String(time).padStart(3, "0")));
    }, 1000);
  }

  init() {
    this.initHeader();
    this.initBoard();
    this.initTimer();
    this.generateGrid(9, 12);
  }

  generateGrid = (width: number, height: number) => {
    const size = width * height;
    const field = Array(size).fill(-1);
    const bombs = Math.round((10 / size) * size);

    // Add bombs!
    const validBombLocations = [...Array(size).keys()];
    for (var i = 0; i < bombs; i++) {
      // Get a random location.
      var pos = Math.round(Math.random() * (validBombLocations.length - 0) + 0);
      // Make it a bomb.
      field[pos] = 9;
      // Remove it from valid locations so we don't duplicate.
      validBombLocations.splice(pos, 1);
    }

    // Add numbers!
    for (var n = 0; n < size; n++) {
      let fVal = field[n];
      if (fVal == 9) continue; // Ignore if bomb
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
        if (field[i] == 9) finalNumber++;
      }

      field[n] = finalNumber;
    }

    this.matrix = field
    this.rehydrate()
  };

  rehydrate() {
    if (!this.matrix) return
    if (this.grid === undefined) {
      const grid = document.createElement("div");
      grid.className = "grid";
      this.board?.appendChild(grid)
      this.grid = grid
    }
    const rows = Array(this.height)
      .fill("-1")
      .map((_v, rowIndex) => {
        return Row(
          Array(this.width)
            .fill("-1")
            .map((_v, columnIndex) => {
              const dataId = rowIndex * this.width + columnIndex;
              return Button({
                dataId: `${dataId}`,
                bomb: this.matrix![dataId] === 9,
                surrounds: this.matrix![dataId],
              });
            }),
          `${rowIndex}`
        );
      });
    this.grid.innerHTML = ""
    rows.map((v) => this.grid!.appendChild(v));
  }
}

const canvas1 = document.querySelector("#app1");
const canvas2 = document.querySelector("#app2");

if ( canvas1 && canvas2 ) {
  new Mineswept(canvas1, 9, 12);
  new Mineswept(canvas2, 9, 12);
}