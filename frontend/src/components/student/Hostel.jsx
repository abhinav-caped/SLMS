// src/components/student/Hostel.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentHostel = () => {
  const [hostelData, setHostelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        // Fetch hostel details
        const hostelResponse = await axios.get(`http://localhost:5000/students/${user.user_id}/hostel`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch complaints
        const complaintsResponse = await axios.get(`http://localhost:5000/students/${user.user_id}/hostel/complaints`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setHostelData(hostelResponse.data);
        setComplaints(complaintsResponse.data);
      } catch (err) {
        console.error('Error fetching hostel data:', err);
        setError('Failed to load hostel data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHostelData();
  }, []);
  
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.trim()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.post(
        `http://localhost:5000/students/${user.user_id}/hostel/complaints`,
        { description: newComplaint },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setComplaints([...complaints, response.data]);
      setNewComplaint('');
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
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
      <h1 className="text-3xl font-bold mb-6">Hostel Information</h1>
      
      {hostelData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hostel Details Card */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Hostel Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Hostel Block</p>
                <p className="font-semibold text-lg">{hostelData.hostel_block}</p>
              </div>
              <div>
                <p className="text-gray-600">Room Number</p>
                <p className="font-semibold text-lg">{hostelData.room_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Room Type</p>
                <p className="font-semibold text-lg">{hostelData.room_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Floor</p>
                <p className="font-semibold text-lg">{hostelData.floor}</p>
              </div>
              <div>
                <p className="text-gray-600">Allocation Date</p>
                <p className="font-semibold text-lg">{hostelData.allocation_date}</p>
              </div>
              <div>
                <p className="text-gray-600">Room Fees</p>
                <p className="font-semibold text-lg">₹{hostelData.room_fees}</p>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Room Facilities</h3>
              <ul className="grid grid-cols-2 gap-2">
                {hostelData.facilities.map((facility, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {facility}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Warden Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Warden Information</h2>
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-2"></div>
              <h3 className="font-semibold">{hostelData.warden_name}</h3>
              <p className="text-sm text-gray-600">Hostel Warden</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>{hostelData.warden_phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>{hostelData.warden_email}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Office: {hostelData.warden_office}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-800">Office Hours: {hostelData.office_hours}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are not currently assigned to any hostel. Please contact the hostel administration office.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Complaints Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Maintenance Requests & Complaints</h2>
        
        <form onSubmit={handleSubmitComplaint} className="mb-6">
          <div className="mb-4">
            <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-1">
              New Request/Complaint
            </label>
            <textarea
              id="complaint"
              rows="3"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Describe your issue..."
              value={newComplaint}
              onChange={(e) => setNewComplaint(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        
        <h3 className="font-semibold text-lg mb-2">Previous Requests</h3>
        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    complaint.status === 'Resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : complaint.status === 'In Progress' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {complaint.status}
                  </span>
                  <span className="text-sm text-gray-500">{complaint.date}</span>
                </div>
                <p className="mt-2">{complaint.description}</p>
                {complaint.response && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-600">Response: {complaint.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No previous complaints or requests.</p>
        )}
      </div>
    </div>
  );
};

export default StudentHostel;
