// src/components/student/Attendance.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        const response = await axios.get(`http://localhost:5000/students/${user.user_id}/attendance`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAttendance(response.data);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, []);
  
  // Calculate overall attendance percentage
  const calculateOverallAttendance = () => {
    if (attendance.length === 0) return 0;
    
    const totalPresent = attendance.reduce((sum, course) => sum + course.present, 0);
    const totalClasses = attendance.reduce((sum, course) => sum + course.total_classes, 0);
    
    return totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  };
  
  const overallAttendance = calculateOverallAttendance();
  
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
      <h1 className="text-3xl font-bold mb-6">Attendance Record</h1>
      
      {/* Overall Attendance Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Attendance</h2>
        <div className="flex items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={overallAttendance >= 75 ? "#48bb78" : "#f56565"}
                strokeWidth="3"
                strokeDasharray={`${overallAttendance}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallAttendance}%</span>
            </div>
          </div>
          <div className="ml-6">
            <p className="text-lg">
              Status: 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                overallAttendance >= 75
                ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {overallAttendance >= 75 ? 'Good Standing' : 'Attendance Warning'}
              </span>
            </p>
            <p className="text-gray-600 mt-2">
              {overallAttendance >= 75 
                ? 'Your attendance is above the required 75% threshold.' 
                : 'Your attendance is below the required 75% threshold. Please improve your attendance to avoid academic penalties.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Course-wise Attendance Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Course-wise Attendance</h2>
        
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Course Code</th>
                  <th className="py-3 px-4 text-left border-b">Course Name</th>
                  <th className="py-3 px-4 text-left border-b">Classes Attended</th>
                  <th className="py-3 px-4 text-left border-b">Total Classes</th>
                  <th className="py-3 px-4 text-left border-b">Percentage</th>
                  <th className="py-3 px-4 text-left border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((course, index) => {
                  const percentage = course.total_classes > 0 
                    ? Math.round((course.present / course.total_classes) * 100) 
                    : 0;
                    
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b">{course.course_id}</td>
                      <td className="py-3 px-4 border-b">{course.course_name}</td>
                      <td className="py-3 px-4 border-b">{course.present}</td>
                      <td className="py-3 px-4 border-b">{course.total_classes}</td>
                      <td className="py-3 px-4 border-b">{percentage}%</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          percentage >= 75 
                            ? 'bg-green-100 text-green-800' 
                            : percentage >= 65 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {percentage >= 75 
                            ? 'Good' 
                            : percentage >= 65 
                              ? 'Warning' 
                              : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No attendance records found.</p>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Attendance Policy</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-blue-700">
            <li>Minimum 75% attendance is required in each course</li>
            <li>Students with attendance below 65% may be barred from examinations</li>
            <li>Medical leaves require proper documentation submitted to the department</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
