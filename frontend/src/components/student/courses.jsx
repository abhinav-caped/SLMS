// src/components/student/Courses.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        const response = await axios.get(`http://localhost:5000/students/${user.user_id}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  const currentCourses = courses.filter(course => course.status === 'current');
  const pastCourses = courses.filter(course => course.status === 'completed');
  
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
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('current')}
            >
              Current Courses
            </button>
            <button
              className={`${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('past')}
            >
              Past Courses
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'current' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Semester Courses</h2>
          {currentCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left border-b">Course Code</th>
                    <th className="py-3 px-4 text-left border-b">Course Title</th>
                    <th className="py-3 px-4 text-left border-b">Credits</th>
                    <th className="py-3 px-4 text-left border-b">Instructor</th>
                    <th className="py-3 px-4 text-left border-b">Schedule</th>
                    <th className="py-3 px-4 text-left border-b">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b">{course.course_id}</td>
                      <td className="py-3 px-4 border-b">{course.title}</td>
                      <td className="py-3 px-4 border-b">{course.credits}</td>
                      <td className="py-3 px-4 border-b">{course.instructor}</td>
                      <td className="py-3 px-4 border-b">{course.schedule}</td>
                      <td className="py-3 px-4 border-b">{course.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No current courses found.</p>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Courses & Grades</h2>
          {pastCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left border-b">Course Code</th>
                    <th className="py-3 px-4 text-left border-b">Course Title</th>
                    <th className="py-3 px-4 text-left border-b">Semester</th>
                    <th className="py-3 px-4 text-left border-b">Year</th>
                    <th className="py-3 px-4 text-left border-b">Credits</th>
                    <th className="py-3 px-4 text-left border-b">Grade</th>
                    <th className="py-3 px-4 text-left border-b">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {pastCourses.map((course, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b">{course.course_id}</td>
                      <td className="py-3 px-4 border-b">{course.title}</td>
                      <td className="py-3 px-4 border-b">{course.semester}</td>
                      <td className="py-3 px-4 border-b">{course.year}</td>
                      <td className="py-3 px-4 border-b">{course.credits}</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ['A', 'A-', 'B+', 'B'].includes(course.grade) 
                            ? 'bg-green-100 text-green-800' 
                            : ['B-', 'C+', 'C'].includes(course.grade)
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {course.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">{course.gpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No past courses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
