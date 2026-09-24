import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import Books from "./pages/Books.jsx";
import BookDetails from "./pages/BookDetails";
import MyBooks from "./pages/MyBooks";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AdminBooks from "./pages/AdminBooks";
import AdminStudents from "./pages/AdminStudents";
import AdminIssues from "./pages/AdminIssues";
import AdminFines from "./pages/AdminFines";
import AdminSettings from "./pages/AdminSettings";





const App = () => {
return ( <BrowserRouter> <Routes>
{/* Public Routes */}
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/verify-otp" element={<VerifyOTP />} />

    {/* Library and Dashboard Routes */}
    <Route path="/books" element={<Books />} />
    <Route path="/book/:id" element={<BookDetails />} />
    <Route path="/user/dashboard" element={<StudentDashboard />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/my-books" element={<MyBooks />} />
    <Route path="/profile" element={<Profile />} />

<Route path="/admin/books" element={<AdminBooks />} />
<Route path="/admin/students" element={<AdminStudents />} />
<Route path="/admin/issues" element={<AdminIssues />} />
<Route path="/admin/fines" element={<AdminFines />} />
<Route path="/admin/settings" element={<AdminSettings />} />
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

);
};

export default App;
