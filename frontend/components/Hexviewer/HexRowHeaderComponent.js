import React from "react";

function HexRowHeaderComponent() {
  return (
    <>
    <div className="hex-row flex flex-row w-full text-sm font-semibold bg-white pt-1 sticky top-0 z-10">
      <span className="address-part w-[10%] flex justify-center px-1 text-gray-500">
        {`Address`}
      </span>
      <span className="hex-part w-3/6 px-1 flex justify-center text-gray-500">{`Hex`}</span>
      <span className="ascii-part w-2/6 px-1  ml-[3%] flex justify-center text-gray-500">{`ASCII`}</span>
    </div>
    <div className="hex-row flex flex-row w-full text-xs font-bold bg-white sticky top-[24px] shadow-sm z-10 mb-2">
      <span className="address-part w-[10%] flex justify-center px-1 text-gray-500">
      </span>
      <span className="hex-part w-3/6 px-1">
      <span className="w-full flex justify-between relative">
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">0</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">1</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">2</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">3</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">4</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">5</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">6</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">7</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">8</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">9</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">A</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">B</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">C</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">D</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">E</span>
        <span className="text-gray-500 p-0.5 bg-white select-none hex-num">F</span>
      </span>
      </span>
      <span className="ascii-part w-2/6 px-1  ml-[3%] flex font-bold justify-center text-gray-500">
      <span className="w-full flex justify-between">
        <span className="ascii-cell-0-0 text-gray-400 p-0.5 bg-white select-none ascii-w">0</span>
        <span className="ascii-cell-0-1 text-gray-400 p-0.5 bg-white select-none ascii-w">1</span>
        <span className="ascii-cell-0-2 text-gray-400 p-0.5 bg-white select-none ascii-w">2</span>
        <span className="ascii-cell-0-3 text-gray-400 p-0.5 bg-white select-none ascii-w">3</span>
        <span className="ascii-cell-0-4 text-gray-400 p-0.5 bg-white select-none ascii-w">4</span>
        <span className="ascii-cell-0-5 text-gray-400 p-0.5 bg-white select-none ascii-w">5</span>
        <span className="ascii-cell-0-6 text-gray-400 p-0.5 bg-white select-none ascii-w">6</span>
        <span className="ascii-cell-0-7 text-gray-400 p-0.5 bg-white select-none ascii-w">7</span>
        <span className="ascii-cell-0-8 text-gray-400 p-0.5 bg-white select-none ascii-w">8</span>
        <span className="ascii-cell-0-9 text-gray-400 p-0.5 bg-white select-none ascii-w">9</span>
        <span className="ascii-cell-0-10 text-gray-400 p-0.5 bg-white select-none ascii-w">A</span>
        <span className="ascii-cell-0-11 text-gray-400 p-0.5 bg-white select-none ascii-w">B</span>
        <span className="ascii-cell-0-12 text-gray-400 p-0.5 bg-white select-none ascii-w">C</span>
        <span className="ascii-cell-0-13 text-gray-400 p-0.5 bg-white select-none ascii-w">D</span>
        <span className="ascii-cell-0-14 text-gray-400 p-0.5 bg-white select-none ascii-w">E</span>
        <span className="ascii-cell-0-15 text-gray-400 p-0.5 bg-white select-none ascii-w">F</span>
      </span>
      </span>
    </div>
    </>
  );
}

export default HexRowHeaderComponent;
