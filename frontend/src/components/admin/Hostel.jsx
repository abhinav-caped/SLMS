// src/components/admin/Hostel.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminHostel = () => {
  const [hostelData, setHostelData] = useState({
    blocks: [],
    rooms: [],
    allocations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(''); // Used in filtering allocations
  const [searchTerm, setSearchTerm] = useState(''); // Used in filtering allocations
  const [complaints, setComplaints] = useState([]); // Used in rendering complaints table
  
  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch hostel blocks
        const blocksResponse = await axios.get('http://localhost:5000/admin/hostel/blocks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch room types
        const roomsResponse = await axios.get('http://localhost:5000/admin/hostel/rooms', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch allocations
        const allocationsResponse = await axios.get('http://localhost:5000/admin/hostel/allocations', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch complaints
        const complaintsResponse = await axios.get('http://localhost:5000/admin/hostel/complaints', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setHostelData({
          blocks: blocksResponse.data,
          rooms: roomsResponse.data,
          allocations: allocationsResponse.data
        });
        
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
  
  // Filter allocations based on block and search term
  const filteredAllocations = hostelData.allocations.filter(allocation => { // Used in rendering allocations table
    const matchesBlock = selectedBlock === '' || allocation.hostel_block === selectedBlock;
    const matchesSearch = searchTerm === '' || 
                          allocation.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          allocation.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          allocation.room_number.toString().includes(searchTerm);
    
    return matchesBlock && matchesSearch;
  });
  
  // Count occupied and vacant rooms
  const countRooms = () => {
    const blocks = {};
    
    hostelData.blocks.forEach(block => {
      blocks[block.block_name] = {
        total: block.total_rooms,
        occupied: 0
      };
    });
    
    hostelData.allocations.forEach(allocation => {
      if (blocks[allocation.hostel_block]) {
        blocks[allocation.hostel_block].occupied += 1;
      }
    });
    
    return blocks;
  };
  
  const roomCounts = countRooms(); // Used in rendering blocks overview
  
  const handleUpdateStatus = async (complaintId, newStatus) => { // Used in updating complaint status
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/admin/hostel/complaints/${complaintId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus } 
            : complaint
        )
      );
    } catch (err) {
      console.error('Error updating complaint status:', err);
      alert('Failed to update complaint status. Please try again.');
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
      <h1 className="text-3xl font-bold mb-6">Hostel Management</h1>
      
      {/* Hostel Blocks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {hostelData.blocks.map((block, index) => {
          const blockStats = roomCounts[block.block_name] || { total: 0, occupied: 0 };
          const occupancyRate = blockStats.total > 0 
            ? Math.round((blockStats.occupied / blockStats.total) * 100) 
            : 0;
            
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{block.block_name}</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total Rooms:</span> {blockStats.total}</p>
                <p><span className="font-medium">Occupied:</span> {blockStats.occupied}</p>
                <p><span className="font-medium">Vacant:</span> {blockStats.total - blockStats.occupied}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        occupancyRate >= 90 ? 'bg-red-500' :
                        occupancyRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Occupancy: {occupancyRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Room Allocations */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Room Allocations</h2>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="">All Blocks</option>
            {hostelData.blocks.map((block, index) => (
              <option key={index} value={block.block_name}>{block.block_name}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search by student ID, name or room number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-2 w-full"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left border-b">Student ID</th>
                <th className="py-3 px-4 text-left border-b">Name</th>
                <th className="py-3 px-4 text-left border-b">Block</th>
                <th className="py-3 px-4 text-left border-b">Room No</th>
                <th className="py-3 px-4 text-left border-b">Room Type</th>
                <th className="py-3 px-4 text-left border-b">Allocation Date</th>
                <th className="py-3 px-4 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((allocation, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b">{allocation.student_id}</td>
                  <td className="py-3 px-4 border-b">{allocation.student_name}</td>
                  <td className="py-3 px-4 border-b">{allocation.hostel_block}</td>
                  <td className="py-3 px-4 border-b">{allocation.room_number}</td>
                  <td className="py-3 px-4 border-b">{allocation.room_type}</td>
                  <td className="py-3 px-4 border-b">{allocation.allocation_date}</td>
                  <td className="py-3 px-4 border-b">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAllocations.length === 0 && (
          <p className="text-gray-500 mt-4">No allocations found matching your criteria.</p>
        )}
      </div>
      
      {/* Maintenance Requests & Complaints */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Maintenance Requests & Complaints</h2>
        
        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left border-b">ID</th>
                  <th className="py-3 px-4 text-left border-b">Student</th>
                  <th className="py-3 px-4 text-left border-b">Block/Room</th>
                  <th className="py-3 px-4 text-left border-b">Description</th>
                  <th className="py-3 px-4 text-left border-b">Date</th>
                  <th className="py-3 px-4 text-left border-b">Status</th>
                  <th className="py-3 px-4 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b">{complaint.id}</td>
                    <td className="py-3 px-4 border-b">{complaint.student_name} ({complaint.student_id})</td>
                    <td className="py-3 px-4 border-b">{complaint.hostel_block}/{complaint.room_number}</td>
                    <td className="py-3 px-4 border-b">{complaint.description}</td>
                    <td className="py-3 px-4 border-b">{complaint.date}</td>
                    <td className="py-3 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complaint.status === 'Resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : complaint.status === 'In Progress' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
                        className="border rounded-md p-1 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No complaints or maintenance requests found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminHostel;

