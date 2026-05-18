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

      {/* <h2 className="font-sans font-bold text-2xl">Noxy</h2> */}
       <img src="/images/logo-alb-2.png" alt="logo-image" className="object-cover w-fit h-6 drop-shadow-[0_0_0px_rgba(255,255,255,0.8)]"/>
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
