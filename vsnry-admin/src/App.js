import React from "react";
import Login from "./components/Login";
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext" 
import PrivateOutlet from "./components/PrivateOutlet";
import AuthConfirm from "./components/AuthConfirm";
import LoginOutlet from "./components/LoginOutlet";
import AuthConfirmOutlet from "./components/AuthConfirmOutlet";

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
            <Route path="/login" element={
                <LoginOutlet>
                  <Login />
                </LoginOutlet>
              }
            />
            <Route path="/confirm-login" element={
                <AuthConfirmOutlet>
                  <AuthConfirm />
                </AuthConfirmOutlet>
              }
            />
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;