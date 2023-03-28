import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { COLOR_PALLETTE } from "../../keys";

export function ColorChoosingComponent(props) {
  const { onClose, selectedItem, open } = props;

  const handleClose = () => {
    onClose(selectedItem.id, selectedItem.color);
  };

  const handleListItemClick = (value) => {
    onClose(selectedItem.id, value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <div className=" text-gray-500 mb-1 p-2">Choose the highlight color</div>
      <div className="flex justify-between items-center w-full p-2">
        {COLOR_PALLETTE.map((color, index) => {
          return (
            <div
              key={`color-palette-${index}`}
              style={{ backgroundColor: color }}
              onClick={(e) => handleListItemClick(color)}
              className={`rounded-full w-6 h-6 mr-1 cursor-pointer border border-gray-300`}
            ></div>
          );
        })}
      </div>
    </Dialog>
  );
}
