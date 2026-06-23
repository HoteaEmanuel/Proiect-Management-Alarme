import useAuthStore from "@store/authStore";
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "@styles/components/User.css";
import { UserModal } from "./UserModal";
import Button from "./Button";
const User = ({ showName = false }) => {
  const { user } = useAuthStore();
  console.log("USER");
  console.log(user);
  const [isOpen, setIsOpen] = useState(false);
  const initial = user.username?.[0].toUpperCase();

  return (
    <div className="flex gap-2">  
      {showName && <span>{user.username}</span>}
      <Button onClick={() => setIsOpen((prev) => !prev)}>
        {user?.avatar_key ? (
          <img
            src={user.avatar_key}
            alt="avatar"
            className="user-modal__avatar"
          />
        ) : (
          <div className="user-modal__initials">{initial}</div>
        )}
      </Button>

      {isOpen && <UserModal onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default User;
