import React from "react";
import { useAuthStore } from "../store/authStore";

const Header = () => {
  const { user } = useAuthStore();
  console.log(user);
  return (
    <div className="w-screen h-1/10 flex items-center justify-end p-2 border-2">
      <h1>
        Welcome: <span className="font-bold">{user.username}</span>
      </h1>
    </div>
  );
};

export default Header;
