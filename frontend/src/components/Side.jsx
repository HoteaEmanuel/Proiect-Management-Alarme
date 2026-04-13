import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatboxes } from "react-icons/io";
import { useNavigate } from "react-router-dom";
const Side = () => {
  const navigate = useNavigate();
  return (
    <aside className="w-1/5 border shadow-2xl p-5 flex flex-col justify-items-center items-center gap-4">
      <h1 className="text-2xl font-bold">Alarm Manager</h1>
      <div
        className="flex items-center gap-4 justify-between w-1/2 cursor-pointer "
        onClick={() => navigate("/dashboard")}
      >
        <MdDashboard className="size-7 hover:scale-105" />
        <h1>Dashboard</h1>
      </div>

      <div
        className="flex items-center gap-4 justify-between w-1/2 cursor-pointer"
        onClick={() => navigate("/dashboard/statistics")}
      >
        <IoIosStats className="size-7 hover:scale-105" />
        <h1>Statistics</h1>
      </div>

      <div className="flex items-center gap-4 justify-between w-1/2 cursor-pointer">
        <IoIosChatboxes className="size-7 hover:scale-105" />
        <h1>Chats</h1>
      </div>

      <div className="flex items-center gap-4 justify-between w-1/2 cursor-pointer" onClick={()=>navigate('/settings')}>
        <IoMdSettings className="size-7 hover:scale-105" />
        <h1>Settings</h1>
      </div>
    </aside>
  );
};

export default Side;
