import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequireAuth from "./components/RequireAuth";
import Navbar from "./components/Navbar";


import { Navigate } from "react-router-dom";


import ItineraryList from "./pages/ItineraryList";
import ItineraryDetail from "./pages/ItineraryDetail"; // we’ll build next
 

export default function App() {
  return (
    <>
      <Navbar />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

<Route
        path="/itineraries"
        element={
          <RequireAuth>
            <ItineraryList />
          </RequireAuth>
        }
      />
      <Route
        path="/itineraries/:id"
        element={
          <RequireAuth>
            <ItineraryDetail />
          </RequireAuth>
        }
      />
      {/* redirect “/” to list */}
      <Route path="/" element={<Navigate to="/itineraries" replace />} />
    </Routes>
    </>
  );
}
