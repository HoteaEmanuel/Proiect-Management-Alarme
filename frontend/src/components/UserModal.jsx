/* UserModal.jsx */
import useAuthStore from "@store/authStore";
import "@styles/components/UserModal.css";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@features/auth/api/auth.api";
import { MdLogout } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
export const UserModal = ({ onClose }) => {
  const { user } = useAuthStore();
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const initial = user.username?.[0].toUpperCase();

  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
      clearAuth();
      setIsLoggingOut(false);
      //   setShowLogoutModal(false);
      navigate("/login");
    }
  };

  console.log("USER FROM MODAL:)");
  console.log(user);
  return (
    <div
      ref={ref}
      className="user-modal"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onClose();
      }}
    >
      <div className="user-modal__header">
        {user.avatar_key ? (
          <img
            src={user.avatar_key}
            alt="avatar"
            className="user-modal__avatar"
          />
        ) : (
          <div className="user-modal__initials">{initial}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <p className="user-modal__name">{user.username}</p>
          <p className="user-modal__email">{user.email}</p>
        </div>
      </div>

      <div className="user-modal__menu">
        <Button className="user-modal__item" onClick={onClose}>
          <CgProfile className="size-4" />
          <Link to={"/profile"}>Profile</Link>
        </Button>
      </div>

      <div className="user-modal__footer">
        <Button
          className="user-modal__item user-modal__item--danger"
          onClick={handleLogout}
        >
          <MdLogout />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  );
};
