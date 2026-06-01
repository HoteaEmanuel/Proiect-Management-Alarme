import useAuthStore from "@store/authStore";
import React, { useState } from "react";
import "@styles/pages/UserProfile.css";
import Button from "@components/Button";
import { MdLogout } from "react-icons/md";
import { ChangePasswordModal } from "@components/ChangePasswordModal";

const UserProfile = () => {
  const { user } = useAuthStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const initial = user.username?.[0].toUpperCase();


  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-card__avatar-section">
          {user.avatar_key ? (
            <img
              src={user.avatar_key}
              alt="avatar"
              className="profile-card__avatar"
            />
          ) : (
            <div className="profile-card__initials">{initial}</div>
          )}
          <h2 className="profile-card__username">{user.username}</h2>
          <p className="profile-card__email">{user.email}</p>
        </div>

        <div className="profile-card__divider" />

        <div className="profile-card__actions">
          <Button className="profile-card__action-btn" onClick={()=>setShowChangePassword(true)}>
            <img
              src="/images/security.png"
              alt="change password icon"
              className="w-7"
            />
            Change password
          </Button>
          <Button className="profile-card__action-btn profile-card__action-btn--danger">
            <MdLogout className="size-8" />
            Sign out
          </Button>
        </div>
      </div>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
};

export default UserProfile;
