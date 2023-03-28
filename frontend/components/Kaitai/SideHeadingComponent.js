import React from "react";
// import BackupTableIcon from '@mui/icons-material/BackupTable';
function SideHeadingComponent({ text, selectedTemplate, exportTable, showExportToTable }) {
  return (
    <div className="text-sm font-semibold text-gray-500 shadow-sm mb-1 py-1 px-1 bg-white sticky top-0">
      {text}
      
      { showExportToTable &&
      <button
        style={{float:'right', background: 'grey', color: 'white', borderRadius:'5px', padding: '0 5px'}}
        onClick={exportTable}
      >
        Export to Table
      </button>
      }
    </div>
  );
}

export default SideHeadingComponent;
