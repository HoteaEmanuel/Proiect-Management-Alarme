import React from "react";
import LoginForm from "../../features/auth/components/LoginForm.jsx";
import "../../styles/pages/auth/Login.css";
import { usePageTitle } from "@hooks/usePageTitle.js";

const Login = () => {
  usePageTitle('Noxy | Login');
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default Login;
