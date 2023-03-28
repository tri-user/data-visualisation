import React from "react";
import EventNoteIcon from "@mui/icons-material/EventNote";

function AnnotationButtonComponent({ data }) {
  const handleMouseDown = () => {
    const ids = data.content.ids;
    ids.forEach((id) => {
      document.getElementById(id).classList.add("cell-annotate");
    });
  };

  const handleMouseUp = () => {
    const ids = data.content.ids;
    ids.forEach((id) => {
      document.getElementById(id).classList.remove("cell-annotate");
    });
  };

  return (
    <button
      className="w-6 h-6 rounded-full bg-blue-400 hover:bg-blue-600 text-white absolute top-0 -left-7 annotation-icon active:bg-blue-600"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title={data.name}
    >
      <EventNoteIcon style={{ fontSize: "14px" }} />
    </button>
  );
}

export default AnnotationButtonComponent;
