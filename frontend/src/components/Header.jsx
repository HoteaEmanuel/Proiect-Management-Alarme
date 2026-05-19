import React from "react";
import useAuthStore from "@store/authStore.js";
import "@styles/components/Header.css";
import Button from "./Button";
import { IoIosMenu } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useHeaderStore } from "@store/headerStore";

const Header = ({ onToggle,isSideBarOpen }) => {
  const { user } = useAuthStore();
  const headerVisible = useHeaderStore(
  (state) => state.headerVisible
);
  console.log("HEADER VISIBLE");
  console.log(headerVisible);
  const navigate=useNavigate();
  console.log(user);
  return (
    <header className={`header ${headerVisible ? 'header-visible' : 'header-hidden'}`}>

      {/* <h2 className="font-sans font-bold text-2xl">Noxy</h2> */}
       <img src="/images/logo-alb-2.png" alt="logo-image" id="logo-image" className="object-cover w-fit h-6  brightness-85 hover:brightness-90 cursor-pointer" onClick={()=>navigate('/dashboard')}/>
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
