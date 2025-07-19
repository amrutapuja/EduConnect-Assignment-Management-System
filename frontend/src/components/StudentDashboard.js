import React, { useState, useEffect } from 'react';

import AssignmentSubmissionForm from './AssignmentSubmissionForm';

const StudentDashboard = ({ token, username, showMessage, onLogout }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const fetchAssignments = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/assignments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            } else {
                showMessage('Failed to fetch assignments.', 'error');
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            showMessage('Network error fetching assignments.', 'error');
        }
    };

    useEffect(() => {
        if (token) {
            fetchAssignments();
        }
    }, [token]);

    const handleAssignmentSelect = (assignment) => {
        setSelectedAssignment(assignment);
    };

    const handleSubmissionSuccess = () => {
        setSelectedAssignment(null); 
        showMessage('Assignment submitted successfully!', 'success');
        fetchAssignments(); 
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900">Student Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-lg text-gray-700">Welcome, {username}!</span>
                    <button
                        onClick={onLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {selectedAssignment ? (
                <AssignmentSubmissionForm
                    token={token}
                    assignment={selectedAssignment}
                    onSubmissionSuccess={handleSubmissionSuccess}
                    onBack={() => setSelectedAssignment(null)}
                    showMessage={showMessage}
                />
            ) : (
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">Available Assignments</h3>
                    {assignments.length === 0 ? (
                        <p className="text-gray-600">No assignments available yet.</p>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.map((assignment) => (
                                <li key={assignment.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h4>
                                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                                    <p className="text-sm text-gray-500">Due: {new Date(assignment.due_date).toLocaleString()}</p>
                                    <button
                                        onClick={() => handleAssignmentSelect(assignment)}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                    >
                                        Submit Assignment
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
export default StudentDashboard;
