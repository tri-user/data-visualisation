import React, { useEffect, useState } from "react";

function AsciiCellComponent(props) {
  const [cellDataArray, setCellDataArray] = useState([]);

  useEffect(() => {
    if (props.rowData) {
      setCellDataArray(props.rowData.match(/.{1,2}/g));
    }
  }, [props.rowData]);

  return (
    <span className="w-full flex justify-between">
      {cellDataArray.map((item, index) => {
        return (
          <span
            key={`ascii-cell-${props.rowIndex}-${index}`}
            id={`ascii-cell-${props.rowIndex}-${index}`}
            className={`ascii-cell-${props.rowIndex}-${index} text-gray-400 p-0.5 bg-white select-none ascii-w`}
          >
            {parseInt(item, 16) > 32 && parseInt(item, 16) < 128
              ? String.fromCharCode(parseInt(item, 16))
              : "."}
          </span>
        );
      })}
    </span>
  );
}

export default AsciiCellComponent;
