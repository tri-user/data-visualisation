import React, { useState } from "react";
import SideHeadingComponent from "./SideHeadingComponent";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import { ColorChoosingComponent } from "./ColorChoosingComponent";
import style from "../../styles/dashboard.module.css";

function HighlightComponent(props) {
  const { highlights, setHighlights, removeHighlights } = props;

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEdit, setIsEdit] = useState([]);
  const [editValue, setEditValue] = useState("");

  const handleColorDialogOpen = (item) => {
    setSelectedItem({
      id: item.id,
      color: item.color,
    });
    setOpen(true);
  };

  const handleDialogClose = (id, color) => {
    setOpen(false);
    const updatedHighlights = highlights.map((item) => {
      if (item.id === id) item.color = color;
      return item;
    });
    setHighlights(updatedHighlights);
    setSelectedItem(null);
  };

  const onEditNameClicked = (item) => {
    setIsEdit((prev) => [...prev, item.id]);
    setEditValue(item.name);
  };

  const onDoneEditClicked = (val) => {
    const updatedHighlights = highlights.map((item) => {
      if (item.id === val.id) item.name = editValue;
      return item;
    });
    setHighlights(updatedHighlights);
    setEditValue("");
    setIsEdit((prev) => prev.filter((item) => item !== val.id));
  };

  return (
    <div
      id={`highlighting-container`}
      className={`w-full text-xs overflow-y-auto pl-1 ${style.highlight_container}`}
    >
      {highlights.map((item) => {
        return (
          <div
            key={`selected-item-${item.id}`}
            className="w-full flex justify-between items-center py-2 border-b border-gray-100"
          >
            <div className="w-11/12  text-gray-500">
              <div className="mb-0.5 flex justify-start items-center">
                <div
                  style={{ backgroundColor: item.color }}
                  onClick={(e) => handleColorDialogOpen(item)}
                  className={`rounded-full w-8 h-8 mr-1 cursor-pointer border border-gray-300`}
                ></div>
                <div className="w-2/3 flex flex-col">
                  {isEdit.includes(item.id) ? (
                    <div className="w-full">
                      <input
                        type="text"
                        className="px-1 py-0.5 text-xs focus:outline-none border border-gray-300 rounded mr-1"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                        }}
                      ></input>
                      <button
                        className="select-none focus:outline-none text-xs"
                        onClick={() => onDoneEditClicked(item)}
                      >
                        <DoneIcon style={{ fontSize: 14 }} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => onEditNameClicked(item)}
                      className="w-full font-semibold hover:bg-gray-100 cursor-pointer"
                    >
                      {item.name}
                    </div>
                  )}
                  <div className="w-full text-xs text-gray-300">
                    {`Address: ${item.metadata.address}`}
                  </div>
                </div>
              </div>
              <div className="truncate pr-2">{item.value}</div>
            </div>
            <div
              onClick={() => {
                removeHighlights(item.value);
              }}
              className="w-1/12 text-gray-300 hover:text-gray-500 h-full cursor-pointer"
            >
              <DeleteIcon fontSize="small" />
            </div>
          </div>
        );
      })}

      <ColorChoosingComponent
        selectedItem={selectedItem}
        open={open}
        onClose={handleDialogClose}
      />
    </div>
  );
}

export default HighlightComponent;
