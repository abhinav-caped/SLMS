// src/components/admin/Students.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all students
        const studentsResponse = await axios.get('http://localhost:5000/admin/students', {
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
        
        setStudents(studentsResponse.data);
        setDepartments(departmentsResponse.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Filter students based on search term and department
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesDepartment = filterDepartment === '' || student.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });
  
  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/admin/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Failed to delete student');
      }
    }
  };

  return (
    <div>
      {/* Other JSX code */}
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-gray-200 text-gray-600 rounded-md px-4 py-2 hover:bg-gray-300"
      >
        Next
      </button>
    </div>
  );
};

export default AdminStudents;
