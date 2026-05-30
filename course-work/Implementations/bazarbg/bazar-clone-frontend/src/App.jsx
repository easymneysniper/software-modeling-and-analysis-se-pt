import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AdDetails from "./pages/AdDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateAd from "./pages/CreateAd";
import EditAd from "./pages/EditAd";
import Favorites from "./pages/Favorites";
import MyAds from "./pages/MyAds";
import Messages from "./pages/Messages";
import Safety from "./pages/Safety";
import Delivery from "./pages/Delivery";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <>
      <Navbar />

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ads/:id" element={<AdDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help/safety" element={<Safety />} />
          <Route path="/delivery" element={<Delivery />} />

          <Route
            path="/create-ad"
            element={
              <ProtectedRoute>
                <CreateAd />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-ad/:id"
            element={
              <ProtectedRoute>
                <EditAd />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-ads"
            element={
              <ProtectedRoute>
                <MyAds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
