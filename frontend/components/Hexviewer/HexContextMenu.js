import React from "react";
import { decimalToHex, showInfoToast, showWarningToast } from "../../utils";

const MENU_CLEAR = "Clear Selection";
const MENU_COPY = "Copy Selection";
const MENU_ANNOTATE = "Annotate";
const items = [MENU_ANNOTATE, MENU_COPY, MENU_CLEAR];

export const MenuItem = ({ name, handleClick }) => {
  return (
    <div
      onClick={() => {
        handleClick(name);
      }}
      className="border-b border-gray-100 w-full py-1 bg-white pl-1 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-pastel-grey"
    >
      {name}
    </div>
  );
};

const checkContinuity = () => {
  const receivedIds = Array.from(document.querySelectorAll(".hex-part .cell-down")).map(
    (el) => {
      const id = el.id.split("-");
      return [id[2], id[3]];
    }
  );

  if (receivedIds.length > 0) {
    let expectedIds = [];
    let row = parseInt(receivedIds[0][0]);
    let col = parseInt(receivedIds[0][1]);
    for (let i = 0; i < receivedIds.length; i++) {
      if (col === 16) {
        col = 0;
        row += 1;
      }
      expectedIds.push([row.toString(), col.toString()]);
      col++;
    }

    for (let j = 0; j < receivedIds.length; j++) {
      if (
        receivedIds[j][0] !== expectedIds[j][0] ||
        receivedIds[j][1] !== expectedIds[j][1]
      )
        return false;
    }
    return true;
  }

  return false;
};

function HexContextMenu({ onAnnotationClicked }) {
  const handleClick = (name) => {
    Array.from(document.querySelectorAll(".cell-hover")).map((el) =>
      el.classList.remove("cell-hover")
    );

    switch (name) {
      case MENU_ANNOTATE:
        if (checkContinuity()) {
          const content = Array.from(
            document.querySelectorAll(".hex-part .cell-down")
          ).map((el) => el.innerText);

          const receivedIds = Array.from(
            document.querySelectorAll(".hex-part .cell-down")
          ).map((el) => el.id);

          const id = Array.from(
            document.querySelectorAll(".hex-part .cell-down")
          )[0].id.split("-");

          const address = decimalToHex(parseInt(id[2]) * 16 + parseInt(id[3]));
          onAnnotationClicked({
            data: content.join(""),
            row: id[2],
            ids: receivedIds,
            address: address,
          });
        } else {
          showWarningToast("Please select the consecutive cells to annotate");
        }
        break;
      case MENU_COPY:
        let txtArr = Array.from(document.querySelectorAll(".hex-part .cell-down")).map(
          (el) => el.innerText
        );
        navigator.clipboard.writeText(txtArr.join(""));
        showInfoToast("Text copied to clipboard !");
        break;
      case MENU_CLEAR:
        Array.from(document.querySelectorAll(".cell-down")).forEach((el) => {
          el.classList.remove("cell-down");
        });
        break;

      default:
        break;
    }
  };

  return (
    <div
      id={`context-menu`}
      className="w-32 rounded-sm shadow border border-gray-100 bg-white z-10 context-hidden absolute"
    >
      {items.map((item, index) => {
        return (
          <MenuItem
            key={`context-menu-item-${index}`}
            name={item}
            handleClick={handleClick}
          />
        );
      })}
    </div>
  );
}

export default HexContextMenu;
