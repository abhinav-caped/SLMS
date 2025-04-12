// src/components/admin/Attendance.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:5000/admin/courses', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses data');
      }
    };
    
    fetchCourses();
    
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setAttendanceDate(formattedDate);
  }, []);
  
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    
    if (!courseId) {
      setStudents([]);
      setAttendanceRecords([]);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch students enrolled in the selected course
      const studentsResponse = await axios.get(`http://localhost:5000/admin/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Fetch existing attendance for the selected date if available
      const attendanceResponse = await axios.get(
        `http://localhost:5000/admin/attendance/${courseId}?date=${attendanceDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setStudents(studentsResponse.data);
      
      // Initialize attendance records
      if (attendanceResponse.data && attendanceResponse.data.length > 0) {
        setAttendanceRecords(attendanceResponse.data);
      } else {
        // Create new attendance records for all students
        const newRecords = studentsResponse.data.map(student => ({
          student_id: student.student_id,
          name: student.name,
          present: false
        }));
        setAttendanceRecords(newRecords);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setAttendanceDate(date);
    
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch attendance for the selected date
      const attendanceResponse = await axios.get(
        `http://localhost:5000/admin/attendance/${selectedCourse}?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (attendanceResponse.data && attendanceResponse.data.length > 0) {
        setAttendanceRecords(attendanceResponse.data);
      } else {
        // Create new attendance records for all students
        const newRecords = students.map(student => ({
          student_id: student.student_id,
          name: student.name,
          present: false
        }));
        setAttendanceRecords(newRecords);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.student_id === studentId 
          ? { ...record, present: isPresent } 
          : record
      )
    );
  };
  
  const handleSubmitAttendance = async () => {
    if (!selectedCourse || !attendanceDate) {
      setError('Please select a course and date');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `http://localhost:5000/admin/attendance/${selectedCourse}`,
        {
          date: attendanceDate,
          records: attendanceRecords
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Attendance saved successfully!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Failed to save attendance data');
    } finally {
      setLoading(false);
    }
  };
  
  const markAllPresent = () => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => ({ ...record, present: true }))
    );
  };
  
  const markAllAbsent = () => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => ({ ...record, present: false }))
    );
  };
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select a course</option>
              {courses.map((course, index) => (
                <option key={index} value={course.course_id}>
                  {course.course_id} - {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={handleDateChange}
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>
        
        {selectedCourse && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Student Attendance</h2>
              <div className="space-x-2">
                <button
                  onClick={markAllPresent}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                >
                  Mark All Present
                </button>
                <button
                  onClick={markAllAbsent}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {attendanceRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left border-b">Student ID</th>
                          <th className="py-3 px-4 text-left border-b">Name</th>
                          <th className="py-3 px-4 text-left border-b">Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 border-b">{record.student_id}</td>
                            <td className="py-3 px-4 border-b">{record.name}</td>
                            <td className="py-3 px-4 border-b">
                              <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    checked={record.present}
                                    onChange={() => handleAttendanceChange(record.student_id, true)}
                                    className="form-radio h-5 w-5 text-green-600"
                                  />
                                  <span className="ml-2 text-green-700">Present</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    checked={!record.present}
                                    onChange={() => handleAttendanceChange(record.student_id, false)}
                                    className="form-radio h-5 w-5 text-red-600"
                                  />
                                  <span className="ml-2 text-red-700">Absent</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No students found for this course.</p>
                )}
                
                {attendanceRecords.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSubmitAttendance}
                      disabled={loading}
                      className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Attendance Statistics */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Total Classes</h3>
              <p className="text-2xl font-bold">15</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Average Attendance</h3>
              <p className="text-2xl font-bold">78%</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Students Below 75%</h3>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Students with Low Attendance</h3>
            <ul className="bg-red-50 p-4 rounded-lg">
              <li className="flex justify-between py-2 border-b border-red-100">
                <span>John Doe (S12345)</span>
                <span className="font-medium">65%</span>
              </li>
              <li className="flex justify-between py-2 border-b border-red-100">
                <span>Jane Smith (S12346)</span>
                <span className="font-medium">70%</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Robert Johnson (S12347)</span>
                <span className="font-medium">72%</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
