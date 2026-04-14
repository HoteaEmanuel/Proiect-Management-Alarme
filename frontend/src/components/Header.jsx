import React from "react";
import { useAuthStore } from "../store/authStore";
import "../styles/components/Header.css";

const Header = () => {
  const { user } = useAuthStore();

  console.log(user);

  return (
    <header className="header">
      <p className="header-welcome">
        Welcome: <span className="header-username">{user.username}</span>
      </p>
    </header>
  );
};

export default Header;
