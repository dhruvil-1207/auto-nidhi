import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App() {
  return (
    <Routes>

      {/* default route */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    </Routes>
  )
}

export default App
