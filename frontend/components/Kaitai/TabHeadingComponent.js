import React from "react";

function TabHeadingComponent({ tabs, selectedTab, handleTabClick }) {
  return (
    <div className="shadow-sm mb-1 sticky top-0 flex justify-start pt-1">
      {tabs.map((tab, index) => {
        return (
          <div
            className={`${
              selectedTab == tab
                ? `bg-blue-400 text-white`
                : `bg-white text-gray-500`
            } text-sm py-1 px-1 font-semibold rounded-t-md border border-gray-200 cursor-pointer select-none`}
            key={`tab-${tab}-${index}`}
            onClick={(e) => {
              handleTabClick(tab);
            }}
          >
            {tab}
          </div>
        );
      })}
    </div>
  );
}

export default TabHeadingComponent;
