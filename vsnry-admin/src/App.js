import React from "react";
import Login from "./components/Login";
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext" 
import PrivateOutlet from "./components/PrivateOutlet";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
            <Route path="/" element={ <PrivateOutlet /> }>
              <Route exact path="/" element={ <PrivateOutlet /> }>
                <Route exact path="/" element={ <Dashboard /> } />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;