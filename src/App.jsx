import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
