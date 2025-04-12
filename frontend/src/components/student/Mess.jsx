// src/components/student/Mess.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentMess = () => {
  const [messData, setMessData] = useState(null);
  const [messMenu, setMessMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  useEffect(() => {
    const fetchMessData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.user_id) {
          throw new Error('User information not found');
        }
        
        // Fetch mess subscription details
        const messResponse = await axios.get(`http://localhost:5000/students/${user.user_id}/mess`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch mess menu
        const menuResponse = await axios.get(`http://localhost:5000/mess/${messResponse.data.mess_name}/menu`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setMessData(messResponse.data);
        setMessMenu(menuResponse.data);
      } catch (err) {
        console.error('Error fetching mess data:', err);
        setError('Failed to load mess data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessData();
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
      <h1 className="text-3xl font-bold mb-6">Mess Information</h1>
      
      {messData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mess Details Card */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Mess Name</p>
                <p className="font-semibold text-lg">{messData.mess_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Plan Type</p>
                <p className="font-semibold text-lg">{messData.plan_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Month</p>
                <p className="font-semibold text-lg">{messData.current_month}</p>
              </div>
              <div>
                <p className="text-gray-600">Monthly Fee</p>
                <p className="font-semibold text-lg">₹{messData.monthly_fee}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  messData.payment_status === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {messData.payment_status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Valid Till</p>
                <p className="font-semibold text-lg">{messData.valid_till}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Mess Timings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Breakfast:</span>
                  <span>{messData.timings.breakfast}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch:</span>
                  <span>{messData.timings.lunch}</span>
                </div>
                <div className="flex justify-between">
                  <span>Snacks:</span>
                  <span>{messData.timings.snacks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dinner:</span>
                  <span>{messData.timings.dinner}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mess Menu Card */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Menu</h2>
            
            <div className="mb-4 flex space-x-1 overflow-x-auto">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            
            {messMenu.length > 0 ? (
              <div className="space-y-6">
                {messMenu
                  .filter(item => item.day === selectedDay)
                  .map((menu, index) => (
                    <div key={index}>
                      <div className="border-b pb-4 mb-4">
                        <h3 className="font-semibold text-lg mb-2">Breakfast</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {menu.breakfast.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mt-1.5 mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-b pb-4 mb-4">
                        <h3 className="font-semibold text-lg mb-2">Lunch</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {menu.lunch.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mt-1.5 mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-b pb-4 mb-4">
                        <h3 className="font-semibold text-lg mb-2">Snacks</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {menu.snacks.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mt-1.5 mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Dinner</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {menu.dinner.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mt-1.5 mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No menu available for this day.</p>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Special Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Special meals are served on festival days</li>
                <li>• Menu is subject to change based on seasonal availability</li>
                <li>• For special dietary requirements, please contact the mess manager</li>
              </ul>
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
                You are not currently subscribed to any mess plan. Please visit the mess office to register.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment History */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        
        {messData && messData.payment_history && messData.payment_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Receipt No.</th>
                  <th className="py-3 px-4 text-left border-b">Month</th>
                  <th className="py-3 px-4 text-left border-b">Amount</th>
                  <th className="py-3 px-4 text-left border-b">Payment Date</th>
                  <th className="py-3 px-4 text-left border-b">Payment Mode</th>
                  <th className="py-3 px-4 text-left border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {messData.payment_history.map((payment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b">{payment.receipt_no}</td>
                    <td className="py-3 px-4 border-b">{payment.month}</td>
                    <td className="py-3 px-4 border-b">₹{payment.amount}</td>
                    <td className="py-3 px-4 border-b">{payment.payment_date}</td>
                    <td className="py-3 px-4 border-b">{payment.payment_mode}</td>
                    <td className="py-3 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No payment history available.</p>
        )}
      </div>
    </div>
  );
};

export default StudentMess;
