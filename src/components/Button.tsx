import cc from "classcat";
import { html } from "uhtml";
import { MatrixState } from "../main";

const Button = ({
  dataId,
  revealNearby,
  matrix,
  setMatrix,
  isClicked,
  isBomb,
  isFlagged,
  surroundingBombs,
}: {
  dataId: number;
  revealNearby({ index }: { index: number }): void;
  matrix: MatrixState[];
  setMatrix(val: MatrixState[]): void;
} & MatrixState) => {
  const onClick = () => {
    if (isClicked || isFlagged) return;

    let newMatrix = matrix;

    if (isBomb) {
      var loseSound = new Audio("/audio/lose.wav");
      loseSound.play();
      newMatrix = newMatrix.map((v) => {
        return {
          ...v,
          isClicked: v.isBomb ? true : v.isClicked,
        };
      });
    } else {
      var tickSound = new Audio("/audio/tick.wav");
      tickSound.play();
    }

    if (surroundingBombs !== 0) {
      if (newMatrix[dataId].isFlagged) return;
      newMatrix[dataId].isClicked = true;
      setMatrix(newMatrix);
    } else {
      revealNearby({ index: dataId });
    }
  };

  const onContextMenu = (event: any) => {
    event.preventDefault();

    if (isClicked) return;

    let newMatrix = matrix;

    newMatrix[dataId] = {
      ...newMatrix[dataId],
      isFlagged: !newMatrix[dataId].isFlagged,
    };

    setMatrix(newMatrix);
  };

  const className = cc([
    {
      ["bomb"]: isBomb,
      ["active"]: isClicked,
      ["flagged"]: isFlagged,
    },
  ]);

  const template = html`<button
    type="button"
    onclick=${() => onClick()}
    oncontextmenu=${onContextMenu}
    data-id="${dataId}"
    data-surround="${surroundingBombs}"
    class="${className}"
  ></button>`;

  return template;
};

export { Button };
