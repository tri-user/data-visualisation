import React from "react";
import { decimalToHex } from "../../utils";
import AsciiCellComponent from "./AsciiCellComponent";
import HexCellComponent from "./HexCellComponent";

function HexRowComponent(props) {
  return (
    <div
      className={"hex-row flex flex-row w-full text-xs " + decimalToHex(parseInt(props.index) * 16)}
      id={`row-${props.index}`}
    >
      <span
        id={`row-address-${props.index}`}
        className="address-part w-[10%] flex justify-center uppercase px-1 text-blue-400 select-none"
      >
        {decimalToHex(parseInt(props.index) * 16)}
      </span>
      <span className="hex-part w-3/6 px-1">
        <HexCellComponent rowData={props.rowData} rowIndex={props.index} />
      </span>
      <span className="ascii-part ml-[3%] w-2/6 px-1">
        <AsciiCellComponent rowData={props.rowData} rowIndex={props.index} />
      </span>
    </div>
  );
}

export default HexRowComponent;
