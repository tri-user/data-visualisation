import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";

function AnnotationDialogComponent(props) {
  const { onClose, open, onDone } = props;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleClose = () => {
    onClose();
  };

  const handleDone = () => {
    if (name === "" || desc === "") return;
    onDone(name, desc);
    setName("");
    setDesc("");
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <div className="w-full p-2">
        <div className="w-full flex flex-col justify-start">
          <div className="font-semibold text-gray-500 text-sm mb-0.5">
            Name:
          </div>
          <div className="w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="outline-none border border-gray-300 px-1 py-0.5 text-gray-500"
            ></input>
          </div>
        </div>
        <div className="w-full flex flex-col justify-start mt-1">
          <div className="font-semibold text-gray-500 text-sm mb-0.5">
            Description:
          </div>
          <div className="w-full">
            <textarea
              rows={4}
              cols={20}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="outline-none border border-gray-300 px-1 py-0.5 resize-none w-full text-gray-500"
            ></textarea>
          </div>
        </div>
        <div className="w-full flex justify-between items-center mt-1">
          <button
            className="select-none focus:outline-none text-gray-300 hover:text-gray-500"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="select-none focus:outline-none text-white bg-blue-400 hover:bg-blue-600 px-1 py-0.5 rounded"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default AnnotationDialogComponent;
