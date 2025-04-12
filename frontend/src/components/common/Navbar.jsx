import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Student Lifecycle Management</span>
            </div>
            
            <div className="ml-10 flex items-center space-x-4">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Dashboard
                  </Link>
                  <Link to="/admin/students" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Students
                  </Link>
                  <Link to="/admin/courses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Courses
                  </Link>
                  <Link to="/admin/departments" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Departments
                  </Link>
                  <Link to="/admin/attendance" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Attendance
                  </Link>
                  <Link to="/admin/hostel" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Hostel
                  </Link>
                  <Link to="/admin/mess" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Mess
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/student/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Dashboard
                  </Link>
                  <Link to="/student/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Profile
                  </Link>
                  <Link to="/student/courses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Courses
                  </Link>
                  <Link to="/student/attendance" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Attendance
                  </Link>
                  <Link to="/student/hostel" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Hostel
                  </Link>
                  <Link to="/student/mess" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Mess
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-4">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;