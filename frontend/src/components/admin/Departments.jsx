// src/components/admin/Departments.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingDepartment, setIsAddingDepartment] = useState(false);
    const [newDepartment, setNewDepartment] = useState({
        dept_name: '',
        building: '',
        budget: '',
        hod_name: '',
        description: '',
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get('http://localhost:5000/admin/departments', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setDepartments(response.data);
            } catch (err) {
                console.error('Error fetching departments:', err);
                setError('Failed to load departments data');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDepartment({
            ...newDepartment,
            [name]: value,
        });
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post('http://localhost:5000/admin/departments', newDepartment, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDepartments([...departments, response.data]);
            setIsAddingDepartment(false);
            setNewDepartment({
                dept_name: '',
                building: '',
                budget: '',
                hod_name: '',
                description: '',
            });
        } catch (err) {
            console.error('Error adding department:', err);
            alert('Failed to add department. Please try again.');
        }
    };

    const handleDeleteDepartment = async (deptName) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const token = localStorage.getItem('token');

                await axios.delete(`http://localhost:5000/admin/departments/${deptName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setDepartments(departments.filter((dept) => dept.dept_name !== deptName));
            } catch (err) {
                console.error('Error deleting department:', err);
                alert('Failed to delete department. Please try again.');
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
            <h1 className="text-3xl font-bold mb-6">Department Management</h1>

            {/* Add Department Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsAddingDepartment(!isAddingDepartment)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    {isAddingDepartment ? 'Cancel' : 'Add New Department'}
                </button>
            </div>

            {/* Add Department Form */}
            {isAddingDepartment && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Department</h2>
                    <form onSubmit={handleAddDepartment}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                                <input
                                    type="text"
                                    name="dept_name"
                                    value={newDepartment.dept_name}
                                    onChange={handleInputChange}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                                <input
                                    type="text"
                                    name="building"
                                    value={newDepartment.building}
                                    onChange={handleInputChange}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={newDepartment.budget}
                                    onChange={handleInputChange}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HOD Name</label>
                                <input
                                    type="text"
                                    name="hod_name"
                                    value={newDepartment.hod_name}
                                    onChange={handleInputChange}
                                    className="border rounded-md p-2 w-full"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={newDepartment.description}
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
                                Add Department
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Departments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-purple-600 text-white p-4">
                            <h2 className="text-xl font-semibold">{dept.dept_name}</h2>
                        </div>
                        <div className="p-4">
                            <p>
                                <span className="font-medium">Building:</span> {dept.building}
                            </p>
                            <p>
                                <span className="font-medium">Budget:</span> ₹{dept.budget}
                            </p>
                            <p>
                                <span className="font-medium">HOD:</span> {dept.hod_name}
                            </p>
                            <p className="mt-2">{dept.description}</p>

                            <div className="mt-4 flex justify-between">
                                <div>
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Students: {dept.student_count}
                                    </span>
                                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                                        Courses: {dept.course_count}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteDepartment(dept.dept_name)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDepartments;
