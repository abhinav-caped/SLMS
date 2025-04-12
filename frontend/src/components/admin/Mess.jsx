// src/components/admin/Mess.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMess = () => {
    const [messData, setMessData] = useState({
        mess_plans: [],
        subscriptions: [],
        menu: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMess, setSelectedMess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [editingMenu, setEditingMenu] = useState(false);
    const [menuItems, setMenuItems] = useState({
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const fetchMessData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch mess plans
                const plansResponse = await axios.get('http://localhost:5000/admin/mess/plans', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Fetch subscriptions
                const subscriptionsResponse = await axios.get('http://localhost:5000/admin/mess/subscriptions', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Fetch menu
                const menuResponse = await axios.get('http://localhost:5000/admin/mess/menu', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessData({
                    mess_plans: plansResponse.data,
                    subscriptions: subscriptionsResponse.data,
                    menu: menuResponse.data
                });

                if (plansResponse.data.length > 0) {
                    setSelectedMess(plansResponse.data[0].mess_name);
                }
            } catch (err) {
                console.error('Error fetching mess data:', err);
                setError('Failed to load mess data');
            } finally {
                setLoading(false);
            }
        };

        fetchMessData();
    }, []);

    useEffect(() => {
        // Set menu items when selected day changes
        if (selectedMess && selectedDay) {
            const currentMenu = messData.menu.find(
                item => item.mess_name === selectedMess && item.day === selectedDay
            );

            if (currentMenu) {
                setMenuItems({
                    breakfast: currentMenu.breakfast || [],
                    lunch: currentMenu.lunch || [],
                    snacks: currentMenu.snacks || [],
                    dinner: currentMenu.dinner || []
                });
            } else {
                setMenuItems({
                    breakfast: [],
                    lunch: [],
                    snacks: [],
                    dinner: []
                });
            }
        }
    }, [selectedMess, selectedDay, messData.menu]);

    // Filter subscriptions based on mess and search term
    const filteredSubscriptions = messData.subscriptions.filter(subscription => {
        const matchesMess = selectedMess === '' || subscription.mess_name === selectedMess;
        const matchesSearch =
            searchTerm === '' ||
            subscription.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.student_name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesMess && matchesSearch;
    });

    const handleMenuItemChange = (mealType, index, value) => {
        setMenuItems(prev => {
            const updatedItems = [...prev[mealType]];
            updatedItems[index] = value;
            return { ...prev, [mealType]: updatedItems };
        });
    };

    const addMenuItem = (mealType) => {
        setMenuItems(prev => ({
            ...prev,
            [mealType]: [...prev[mealType], '']
        }));
    };

    const removeMenuItem = (mealType, index) => {
        setMenuItems(prev => {
            const updatedItems = [...prev[mealType]];
            updatedItems.splice(index, 1);
            return { ...prev, [mealType]: updatedItems };
        });
    };

    const handleSaveMenu = async () => {
        try {
            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:5000/admin/mess/menu/${selectedMess}/${selectedDay}`,
                menuItems,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setMessData(prev => {
                const updatedMenu = [...prev.menu];
                const menuIndex = updatedMenu.findIndex(
                    item => item.mess_name === selectedMess && item.day === selectedDay
                );

                if (menuIndex >= 0) {
                    updatedMenu[menuIndex] = {
                        ...updatedMenu[menuIndex],
                        ...menuItems
                    };
                } else {
                    updatedMenu.push({
                        mess_name: selectedMess,
                        day: selectedDay,
                        ...menuItems
                    });
                }

                return { ...prev, menu: updatedMenu };
            });

            setEditingMenu(false);
        } catch (err) {
            console.error('Error saving menu:', err);
            alert('Failed to save menu. Please try again.');
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
            <h1 className="text-3xl font-bold mb-6">Mess Management</h1>
            {/* Rest of the JSX code */}
        </div>
    );
};

export default AdminMess;
  