import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/dashboard/admin', {
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-blue-600">Total Students</h2>
          <p className="text-3xl font-bold">{dashboardData?.total_students || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-green-600">Total Faculty</h2>
          <p className="text-3xl font-bold">{dashboardData?.total_faculty || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-purple-600">Total Departments</h2>
          <p className="text-3xl font-bold">{dashboardData?.total_departments || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-orange-600">Total Courses</h2>
          <p className="text-3xl font-bold">{dashboardData?.total_courses || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Students by Department</h2>
          {dashboardData?.students_by_department && Object.entries(dashboardData.students_by_department).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dashboardData.students_by_department).map(([dept, count]) => (
                    <tr key={dept}>
                      <td className="py-2 px-4 border-b border-gray-200">{dept}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Average CGPA by Department</h2>
          {dashboardData?.avg_cgpa_by_department && Object.entries(dashboardData.avg_cgpa_by_department).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. CGPA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dashboardData.avg_cgpa_by_department).map(([dept, avgCgpa]) => (
                    <tr key={dept}>
                      <td className="py-2 px-4 border-b border-gray-200">{dept}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{avgCgpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
        {dashboardData?.recent_applications && dashboardData.recent_applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App ID
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_applications.map((app) => (
                  <tr key={app.app_id}>
                    <td className="py-2 px-4 border-b border-gray-200">{app.app_id}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{app.student_id}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{app.app_type}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        app.app_status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.app_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.app_status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">{app.submission_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent applications</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;