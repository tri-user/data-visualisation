import React from "react";
import {
  useAnnotation,
  useRemoveAnnotation,
} from "../../contexts/AnnotationContext";
import style from "../../styles/dashboard.module.css";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DeleteIcon from "@mui/icons-material/Delete";

function AnnotationsComponent() {
  const annotations = useAnnotation();
  const removeAnnotate = useRemoveAnnotation();

  const handleMouseDown = (data) => {
    const ids = data.content.ids;
    ids.forEach((id) => {
      document.getElementById(id).classList.add("cell-annotate");
    });

    document.getElementById("main-container").scrollTop =
      document.getElementById(`row-${data.content.row}`).offsetTop - 50;
  };

  const handleMouseUp = (data) => {
    const ids = data.content.ids;
    ids.forEach((id) => {
      document.getElementById(id).classList.remove("cell-annotate");
    });
  };

  return (
    <div
      id={`annotation-container`}
      className={`w-full text-xs overflow-y-auto pl-1 ${style.highlight_container}`}
    >
      {annotations.map((item) => {
        return (
          <div
            key={`selected-item-${item.id}`}
            onMouseDown={() => {
              handleMouseDown(item);
            }}
            onMouseUp={() => {
              handleMouseUp(item);
            }}
            className="w-full flex justify-between items-center py-2 border-b border-gray-100 hover:bg-pastel-grey cursor-pointer"
          >
            <div className="w-11/12  text-gray-500">
              <div className="mb-0.5 flex justify-start items-center">
                <div
                  className={`rounded-full w-8 h-8 mr-1 border bg-blue-400 text-white flex items-center justify-center`}
                >
                  <EventNoteIcon style={{ fontSize: "16px" }} />
                </div>
                <div className="w-2/3 flex flex-col justify-start">
                  <div className="w-full font-semibold text-sm">
                    {item.name}
                  </div>
                  <div className="w-full text-xs text-gray-300">
                    {`Address: ${item.content.address}`}
                  </div>
                </div>
              </div>
              <div className="truncate pr-2 text-sm">{item.description}</div>
            </div>
            <div
              onClick={() => {
                removeAnnotate(item.id);
              }}
              className="w-1/12 text-gray-300 hover:text-gray-500 h-full cursor-pointer"
            >
              <DeleteIcon fontSize="small" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnnotationsComponent;
