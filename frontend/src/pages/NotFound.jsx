import React from "react";
import Button from "@components/Button";
import "@styles/pages/NotFound.css";
import { useNavigate } from "react-router-dom";
import { TbError404 } from "react-icons/tb";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <TbError404 size={200} />
      <h1 className="text-4xl -translate-y-10">Page Not found</h1>

      <button onClick={() => navigate(-1)} className="button">
        Go back to safety
      </button>
    </div>
  );
};

export default NotFound;
