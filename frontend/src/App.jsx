import "./styles/App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rootlayout from "./layouts/Rootlayout.jsx";
import UnauthRoute from "./components/UnauthRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import useCheckAuth from "./hooks/useCheckAuth.js";
import { Statistics } from "./pages/Statistics.jsx";
function App() {
  console.log("IN APP");

  useCheckAuth();
  return (
    <Routes>
      <Route element={<UnauthRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Rootlayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats" element={<Statistics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
