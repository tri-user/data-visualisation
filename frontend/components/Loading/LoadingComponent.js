import React from "react";

function LoadingComponent(props) {
  return (
    props.show && (
      <div className="z-10 w-full h-screen bg-white opacity-90 flex items-center justify-center text-blue-600 absolute top-0 left-0">
        {`Loading .....`}
      </div>
    )
  );
}

export default LoadingComponent;
