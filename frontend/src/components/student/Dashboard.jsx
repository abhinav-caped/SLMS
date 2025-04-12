// src/components/student/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        const response = await axios.get(`http://localhost:5000/dashboard/student/${user.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{dashboardData?.student_info?.name}</h2>
            <p className="text-gray-600">ID: {dashboardData?.student_info?.student_id}</p>
            <p className="text-gray-600">Email: {dashboardData?.student_info?.email}</p>
            <p className="text-gray-600">Phone: {dashboardData?.student_info?.phone}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600">Department: {dashboardData?.student_info?.department}</p>
            <p className="text-gray-600">Joining Date: {dashboardData?.student_info?.joining_date}</p>
            <p className="text-gray-600">Total Credits: {dashboardData?.student_info?.total_credits}</p>
          </div>
        </div>
      </div>
      
      {/* Academic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2">CGPA</h3>
          <p className="text-3xl font-bold text-blue-900">{dashboardData?.academic_summary?.latest_cgpa.toFixed(2)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-green-700 mb-2">Credits Earned</h3>
          <p className="text-3xl font-bold text-green-900">{dashboardData?.academic_summary?.total_credits_earned}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-purple-700 mb-2">Courses Taken</h3>
          <p className="text-3xl font-bold text-purple-900">{dashboardData?.academic_summary?.course_count}</p>
        </div>
      </div>
      
      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Courses</h2>
          <Link to="/student/courses" className="text-blue-600 hover:text-blue-800">View All</Link>
        </div>
        
        {dashboardData?.recent_courses && dashboardData.recent_courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Course ID</th>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Semester</th>
                  <th className="py-2 px-4 text-left">Credits</th>
                  <th className="py-2 px-4 text-left">Grade</th>
                  <th className="py-2 px-4 text-left">GPA</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_courses.map((course, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{course.course_id}</td>
                    <td className="py-2 px-4">{course.course_title}</td>
                    <td className="py-2 px-4">{course.semester}</td>
                    <td className="py-2 px-4">{course.credits}</td>
                    <td className="py-2 px-4">{course.grade}</td>
                    <td className="py-2 px-4">{course.gpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No course data available</p>
        )}
      </div>
      
      {/* Attendance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attendance Summary</h2>
          <Link to="/student/attendance" className="text-blue-600 hover:text-blue-800">View Details</Link>
        </div>
        
        {dashboardData?.attendance_summary && dashboardData.attendance_summary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Present</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Percentage</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.attendance_summary.map((attendance, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{attendance.course_title}</td>
                    <td className="py-2 px-4">{attendance.present}</td>
                    <td className="py-2 px-4">{attendance.total_classes}</td>
                    <td className="py-2 px-4">{attendance.percentage}%</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        attendance.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {attendance.percentage >= 75 ? 'Good' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No attendance data available</p>
        )}
      </div>
      
      {/* Hostel and Mess Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hostel Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Hostel Information</h2>
            <Link to="/student/hostel" className="text-blue-600 hover:text-blue-800">View Details</Link>
          </div>
          
          {dashboardData?.hostel_info ? (
            <div>
              <p><span className="font-semibold">Block:</span> {dashboardData.hostel_info.hostel_block}</p>
              <p><span className="font-semibold">Room Number:</span> {dashboardData.hostel_info.room_number}</p>
              <p><span className="font-semibold">Room Type:</span> {dashboardData.hostel_info.room_type}</p>
              <p><span className="font-semibold">Room Fees:</span> ₹{dashboardData.hostel_info.room_fees}</p>
            </div>
          ) : (
            <p className="text-gray-500">No hostel data available</p>
          )}
        </div>
        
        {/* Mess Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Mess Subscription</h2>
            <Link to="/student/mess" className="text-blue-600 hover:text-blue-800">View Details</Link>
          </div>
          
          {dashboardData?.mess_info && dashboardData.mess_info.length > 0 ? (
            <div>
              <p><span className="font-semibold">Current Mess:</span> {dashboardData.mess_info[0].mess_name}</p>
              <p><span className="font-semibold">Month:</span> {dashboardData.mess_info[0].month}</p>
              <p><span className="font-semibold">Monthly Fee:</span> ₹{dashboardData.mess_info[0].fee}</p>
            </div>
          ) : (
            <p className="text-gray-500">No mess subscription data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
