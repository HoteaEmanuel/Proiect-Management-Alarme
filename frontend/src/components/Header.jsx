import React from "react";
import useAuthStore from "@store/authStore.js";
import "@styles/components/Header.css";
import Button from "./Button";
import { IoIosMenu } from "react-icons/io";

const Header = ({ onToggle,isSideBarOpen }) => {
  const { user } = useAuthStore();

  console.log(user);
  return (
    <header className="header">
      <Button className="cursor-pointer hover:scale-105 menuBtn"  onClick={onToggle} aria-expanded={isSideBarOpen}>
        <IoIosMenu className="size-7" />
      </Button>
      <p className="header-welcome">
        Welcome: <span className="header-username">{user.username}</span>
      </p>
      
    </header>
  );
};

export default Header;
