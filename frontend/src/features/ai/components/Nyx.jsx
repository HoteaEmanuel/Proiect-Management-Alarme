import React from "react";
import Tooltip from "@components/ToolTip";
const Nyx = ({ styte }) => {
  return (
    <div className="hover:scale-105 duration-200">
      <Tooltip text={"Hey! Nyx here"} textSize={10}>
        <img src="/images/Nyx.png" alt="Assistant image" className={styte}  />
      </Tooltip>
    </div>
  );
};

export default Nyx;
