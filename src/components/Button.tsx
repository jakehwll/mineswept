import { MatrixState } from "../main";

const Button = ({
  dataId,
  rehydrate,
  revealNearby,
  matrix,
  setMatrix,
  isClicked,
  isBomb,
  surroundingBombs,
}: {
  dataId: number;
  rehydrate(): void;
  revealNearby({ index }: { index: number; }): void;
  matrix: MatrixState[];
  setMatrix(val: MatrixState[]): void;
} & MatrixState) => {
  const el = document.createElement("button");
  el.className = [""].join(" ");

  el.setAttribute("data-id", `${dataId}`);
  el.setAttribute("data-surround", `${surroundingBombs}`);

  if (isBomb) el.className = ["bomb", ...el.className.split(" ")].join(" ");
  if (isClicked) el.className = ["active", ...el.className.split(" ")].join(" ");

  el.addEventListener("click", () => {
    if (isClicked) return;

    let newMatrix = matrix;

    if (isBomb) {
      var loseSound = new Audio("/audio/lose.wav");
      loseSound.play();
      document.querySelectorAll(".bomb").forEach((el) => {
        el.className = ["active", ...el.className.split(" ")].join(" ");
      });
      newMatrix = newMatrix.map((v) => {
        return {
          ...v,
          clicked: v.isBomb ? true : v.isClicked,
        };
      });
      console;
    } else {
      var tickSound = new Audio("/audio/tick.wav");
      tickSound.play();
    }

    if ( surroundingBombs !== 0 ) {
      newMatrix[dataId].isClicked = true;
      setMatrix(newMatrix);
    } else {
      revealNearby({ index: dataId });
    }

    rehydrate();
  });

  return el;
};

export { Button }