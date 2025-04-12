// src/components/student/Profile.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        // Fetch user details
        const userResponse = await axios.get(`http://localhost:5000/users/${user.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch student details
        const studentResponse = await axios.get(`http://localhost:5000/students/${user.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfile({
          ...userResponse.data,
          ...studentResponse.data
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
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
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>
      
      {profile && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-lg">{profile.student_id}</p>
            <p>{profile.dept_name}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium w-32">Email:</span>
                    <span>{profile.email_id}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Phone:</span>
                    <span>{profile.phone_no}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Gender:</span>
                    <span>{profile.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Date of Birth:</span>
                    <span>{profile.dob}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Address:</span>
                    <span>{profile.address}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Academic Information</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium w-32">Department:</span>
                    <span>{profile.dept_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Joining Date:</span>
                    <span>{profile.joining_date}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Total Credits:</span>
                    <span>{profile.total_credits}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Current CGPA:</span>
                    <span>{profile.cgpa}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex">
                  <span className="font-medium w-32">Name:</span>
                  <span>{profile.emergency_contact_name}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Phone:</span>
                  <span>{profile.emergency_contact_phone}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Relation:</span>
                  <span>{profile.emergency_contact_relation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
