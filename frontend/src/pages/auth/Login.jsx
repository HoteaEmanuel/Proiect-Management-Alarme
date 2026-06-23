import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../features/auth/components/LoginForm.jsx";
import "../../styles/pages/auth/Login.css";
import { usePageTitle } from "@hooks/usePageTitle.js";
import logo from "../../assets/landing/logo-alb-2.png";

const Login = () => {
  usePageTitle('Noxy | Login');
  return (
    <div className="login-page">
      <Link to="/" className="login-page-brand">
        <img src={logo} alt="Noxy" className="login-page-logo" />
      </Link>
      <LoginForm />
    </div>
  );
};

export default Login;
