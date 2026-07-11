import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Search from "./pages/Search.jsx";
import Today from "./pages/Today.jsx";
import Settings from "./pages/Settings.jsx";
import Timeline from "./pages/Timeline.jsx";
import Insights from "./pages/Insights.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/search" element={<Search />} />
        <Route path="/today" element={<Today />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/insights" element={<Insights />} />
      </Route>
    </Routes>
  );
}

export default App;
