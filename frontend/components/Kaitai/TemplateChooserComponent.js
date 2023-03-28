import React, { useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import SideHeadingComponent from "./SideHeadingComponent";

const TEMPLATES = ["jpg", "mbr", "zip", "exfat"];
function TemplateChooserComponent(props) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const onSelectChange = (e) => {
    setSelectedTemplate(e.target.value);
  };
  const onDoneClicked = () => {
    if (selectedTemplate != "") props.handleTemplateSelection(selectedTemplate);
  };
  const exportTable = () => {
      props.exportTableData(selectedTemplate);
  }
  return (
    <div className="w-full">
      <SideHeadingComponent text={`Template`} selectedTemplate={selectedTemplate} exportTable={exportTable} showExportToTable={props.showExportToTable} />
      <div className="w-full flex flex-row item-center justify-between pl-1">
        <select
          defaultValue={"DEFAULT"}
          onChange={onSelectChange}
          className="w-11/12 h-8 border border-gray-300 focus:outline-none rounded text-gray-400"
        >
          <option value="DEFAULT" disabled>
            Choose a template ...
          </option>
          {TEMPLATES.map((item, index) => {
            return (
              <option
                className="border border-gray-300 outline-none rounded"
                value={item}
                key={`template-select-${index}`}
              >
                {item}
              </option>
            );
          })}
        </select>
        <button
          onClick={onDoneClicked}
          className="text-gray-400 px-0.5 hover:text-blue-400 select-none focus:outline-none h-6 w-1/12"
        >
          <DoneIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

export default TemplateChooserComponent;
