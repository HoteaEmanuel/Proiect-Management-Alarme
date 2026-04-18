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
import Settings from "./pages/Settings.jsx";
import ChatWindow from "./pages/ai-chatbot/ChatWindow.jsx";
import Chatlayout from "./layouts/Chatlayout.jsx";
import NewChat from "./pages/ai-chatbot/NewChat.jsx";
import Chats from "./pages/ai-chatbot/Chats.jsx";
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
          <Route path="/dashboard/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route element={<Chatlayout />}>
          {/* <Route path="/chat" element={<ChatWindow />}  /> */}
          <Route path="/chat/new" element={<NewChat />} />
          <Route path="/chats" element={<Chats />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
