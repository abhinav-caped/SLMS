import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/admin/Dashboard';
import StudentDashboard from './components/student/Dashboard';
import StudentProfile from './components/student/Profile';
import AdminStudents from './components/admin/Students';
import AdminCourses from './components/admin/Courses';
import AdminDepartments from './components/admin/Departments';
import AdminAttendance from './components/admin/Attendance';
import AdminHostel from './components/admin/Hostel';
import AdminMess from './components/admin/Mess';
import StudentCourses from './components/student/Courses';
import StudentAttendance from './components/student/Attendance';
import StudentHostel from './components/student/Hostel';
import StudentMess from './components/student/Mess';
import Navbar from './components/common/Navbar';

// Protected Route component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!user || !localStorage.getItem('token')) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Not authorized
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  
  return element;
};

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {user && <Navbar user={user} />}
        <div className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/students" 
              element={<ProtectedRoute element={<AdminStudents />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/courses" 
              element={<ProtectedRoute element={<AdminCourses />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/departments" 
              element={<ProtectedRoute element={<AdminDepartments />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/attendance" 
              element={<ProtectedRoute element={<AdminAttendance />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/hostel" 
              element={<ProtectedRoute element={<AdminHostel />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin/mess" 
              element={<ProtectedRoute element={<AdminMess />} allowedRoles={['admin']} />} 
            />
            
            {/* Student routes */}
            <Route 
              path="/student/dashboard" 
              element={<ProtectedRoute element={<StudentDashboard />} allowedRoles={['student']} />} 
            />
            <Route 
              path="/student/profile" 
              element={<ProtectedRoute element={<StudentProfile />} allowedRoles={['student']} />} 
            />
            <Route 
              path="/student/courses" 
              element={<ProtectedRoute element={<StudentCourses />} allowedRoles={['student']} />} 
            />
            <Route 
              path="/student/attendance" 
              element={<ProtectedRoute element={<StudentAttendance />} allowedRoles={['student']} />} 
            />
            <Route 
              path="/student/hostel" 
              element={<ProtectedRoute element={<StudentHostel />} allowedRoles={['student']} />} 
            />
            <Route 
              path="/student/mess" 
              element={<ProtectedRoute element={<StudentMess />} allowedRoles={['student']} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;