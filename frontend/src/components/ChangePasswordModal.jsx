import React, { useRef, useEffect, useState } from "react";
import "@styles/components/ChangePasswordModal.css";
import Button from "./Button";
import Input from "./Input";
import { useForm } from "react-hook-form";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { authApi } from "@features/auth/api/auth.api";
import { data } from "react-router-dom";
import { toast } from "sonner";

export const ChangePasswordModal = ({ onClose }) => {
  const ref = useRef(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { changePassword } = authApi;
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const {
    handleSubmit,
    register,
    setError,
    formState: { isSubmitting, errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    try {
      await changePassword({
        new_password: data.newPassword,
        old_password: data.oldPassword,
      });

      toast.success("Successfully changed the password");
      onClose();
    } catch (e) {
      console.log(e);
      toast.error("Failed to change password");
      setError("root", {
        type: "manual",
        message: "Something went wrong, please try again",
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div
        ref={ref}
        className="modal"
        tabIndex={-1}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) onClose();
        }}
      >
        <div className="modal__header">
          <h3 className="modal__title">Change password</h3>
          <Button className="modal__close" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal__body">
            {errors.root && (
              <span className="modal__error">{errors.root.message}</span>
            )}
            <div className="modal__field">
              <label className="modal__label" htmlFor="current-password">
                Current password
              </label>
              <div className="modal__input-wrapper">
                <Input
                  className="modal__input"
                  type={showOld ? "text" : "password"}
                  id="current-password"
                  placeholder="Enter current password"
                  {...register("oldPassword", {
                    required: "Current password is required",
                  })}
                />
                <Button
                  type="button"
                  className="modal__eye-btn"
                  onClick={() => setShowOld((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showOld ? <BsEyeSlash /> : <BsEye />}
                </Button>
              </div>
              {errors.oldPassword && (
                <span className="modal__error">
                  {errors.oldPassword.message}
                </span>
              )}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="new-password">
                New password
              </label>
              <div className="modal__input-wrapper">
                <Input
                  className="modal__input"
                  type={showNew ? "text" : "password"}
                  id="new-password"
                  placeholder="Enter new password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                  })}
                />
                <Button
                  type="button"
                  className="modal__eye-btn"
                  onClick={() => setShowNew((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showNew ? <BsEyeSlash /> : <BsEye />}
                </Button>
              </div>
              {errors.newPassword && (
                <span className="modal__error">
                  {errors.newPassword.message}
                </span>
              )}
            </div>
          </div>

          <div className="modal__footer">
            <Button className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="modal__btn modal__btn--confirm"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
