import { MatrixState } from "../main";

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
} & MatrixState) => {
  const el = document.createElement("button");
  el.className = [""].join(" ");

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

    if ( surrounds !== 0 ) {
      newMatrix[dataId].clicked = true;
      setMatrix(newMatrix);
    } else {
      revealNearby({ index: dataId });
    }

    rehydrate();
  });

  return el;
};

export { Button }