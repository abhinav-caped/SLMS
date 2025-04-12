// src/components/admin/Courses.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_id: '',
    title: '',
    department: '',
    credits: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all courses
        const coursesResponse = await axios.get('http://localhost:5000/admin/courses', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch departments for filtering
        const departmentsResponse = await axios.get('http://localhost:5000/admin/departments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCourses(coursesResponse.data);
        setDepartments(departmentsResponse.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Filter courses based on search term and department
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.course_id.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesDepartment = filterDepartment === '' || course.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({
      ...newCourse,
      [name]: value
    });
  };
  
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/admin/courses', newCourse, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourses([...courses, response.data]);
      setIsAddingCourse(false);
      setNewCourse({
        course_id: '',
        title: '',
        department: '',
        credits: '',
        description: ''
      });
    } catch (err) {
      console.error('Error adding course:', err);
      alert('Failed to add course. Please try again.');
    }
  };
  
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`http://localhost:5000/admin/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCourses(courses.filter(course => course.course_id !== courseId));
      } catch (err) {
        console.error('Error deleting course:', err);
        alert('Failed to delete course. Please try again.');
      }
    }
  };
  
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
      <h1 className="text-3xl font-bold mb-6">Course Management</h1>
      
      {/* Add Course Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddingCourse(!isAddingCourse)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {isAddingCourse ? 'Cancel' : 'Add New Course'}
        </button>
      </div>
      
      {/* Add Course Form */}
      {isAddingCourse && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
          <form onSubmit={handleAddCourse}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                <input
                  type="text"
                  name="course_id"
                  value={newCourse.course_id}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={newCourse.title}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={newCourse.department}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  name="credits"
                  value={newCourse.credits}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by course ID or title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md p-2 w-full"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border rounded-md p-2 w-full"
        >
          <option value="">All Departments</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>
      
      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left border-b">Course ID</th>
              <th className="py-3 px-4 text-left border-b">Title</th>
              <th className="py-3 px-4 text-left border-b">Department</th>
              <th className="py-3 px-4 text-left border-b">Credits</th>
              <th className="py-3 px-4 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-4 border-b">{course.course_id}</td>
                <td className="py-3 px-4 border-b">{course.title}</td>
                <td className="py-3 px-4 border-b">{course.department}</td>
                <td className="py-3 px-4 border-b">{course.credits}</td>
                <td className="py-3 px-4 border-b">
                  <button 
                    onClick={() => handleDeleteCourse(course.course_id)}
                    className="text-red-600 hover:text-red-800 mr-3"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
