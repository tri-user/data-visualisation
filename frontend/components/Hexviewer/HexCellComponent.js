import React, { useEffect, useState } from "react";
import { useAnnotation } from "../../contexts/AnnotationContext";
import AnnotationButtonComponent from "./AnnotationButtonComponent";

function HexCellComponent(props) {
  const [cellDataArray, setCellDataArray] = useState([]);
  const [drag, setDrag] = useState(false);
  const annotations = useAnnotation();

  useEffect(() => {
    if (props.rowData) {
      setCellDataArray(props.rowData.match(/.{1,2}/g));
    }
  }, [props.rowData]);

  //highlight cell on mouse drag
  const handleMouseDown = () => {
    setDrag(true);
  };

  const handleMouseMove = (row, col) => {
    if (!drag) return;
    const elementArr = getCell(row, col);
    elementArr.forEach((element) => {
      element.classList.add("cell-down");
    });
  };

  const handleMouseUp = () => {
    setDrag(false);
  };

  //highlight cell on hover
  const getCell = (row, col) => {
    const elementsList = document.querySelectorAll(
      `#hex-cell-${row}-${col}, #ascii-cell-${row}-${col}`
    );
    return [...elementsList];
  };

  const handleMouseEnter = (row, col) => {
    if (drag) return;
    const elementArr = getCell(row, col);
    elementArr.forEach((element) => {
      element.classList.add("cell-hover");
    });
  };

  const handleMouseLeave = (row, col) => {
    if (drag) return;
    const elementArr = getCell(row, col);
    elementArr.forEach((element) => {
      element.classList.remove("cell-hover");
    });
  };
  
  const openContextMenu = (e) => {
    e.preventDefault();
    let ctxMenu = document.getElementById("context-menu");
    ctxMenu.classList.remove("context-hidden");
    ctxMenu.style.left = e.pageX - 10 + "px";
    ctxMenu.style.top = e.pageY - 40 + "px";
  };

  return (
    <span 
      className="w-full flex justify-between relative" 
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => openContextMenu(e)}
    >
      {cellDataArray.map((item, index) => {
        return (
          <span
            key={`hex-cell-${props.rowIndex}-${index}`}
            id={`hex-cell-${props.rowIndex}-${index}`}
            className={`uppercase text-gray-500 p-0.5 bg-white select-none hex-num`}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => {
              handleMouseEnter(props.rowIndex, index);
            }}
            onMouseLeave={() => {
              handleMouseLeave(props.rowIndex, index);
            }}
            
            onMouseMove={() => {
              handleMouseMove(props.rowIndex, index);
            }}
          >
            {item}
          </span>
        );
      })}
      {annotations.filter((item) => item.content.row == props.rowIndex).length >
        0 && (
        <AnnotationButtonComponent
          data={annotations.find((item) => item.content.row == props.rowIndex)}
        />
      )}
    </span>
  );
}

export default HexCellComponent;
