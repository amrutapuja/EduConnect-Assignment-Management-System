// components/TeacherDashboard.js
import React, { useState, useEffect } from 'react';

import AssignmentCreationForm from './AssignmentCreationForm';
import SubmissionViewer from './SubmissionViewer';

const TeacherDashboard = ({ token, username, showMessage, onLogout }) => {
    const [activeTab, setActiveTab] = useState('create'); 
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [submissions, setSubmissions] = useState([]);

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

    const fetchSubmissions = async (assignmentId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/assignments/${assignmentId}/submissions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            } else {
                showMessage('Failed to fetch submissions.', 'error');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            showMessage('Network error fetching submissions.', 'error');
        }
    };

    useEffect(() => {
        if (token && activeTab === 'viewAssignments') {
            fetchAssignments();
        }
        if (token && activeTab === 'viewSubmissions' && selectedAssignmentId) {
            fetchSubmissions(selectedAssignmentId);
        }
    }, [token, activeTab, selectedAssignmentId]);

    const handleViewSubmissionsClick = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        setActiveTab('viewSubmissions');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900">Teacher Dashboard</h1>
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

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-3 px-6 text-lg font-medium ${activeTab === 'create' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('create')}
                >
                    Create Assignment
                </button>
                <button
                    className={`py-3 px-6 text-lg font-medium ${activeTab === 'viewAssignments' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('viewAssignments')}
                >
                    View All Assignments
                </button>
            </div>

            {activeTab === 'create' && (
                <AssignmentCreationForm token={token} showMessage={showMessage} onAssignmentCreated={() => setActiveTab('viewAssignments')} />
            )}

            {activeTab === 'viewAssignments' && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Assignments</h3>
                    {assignments.length === 0 ? (
                        <p className="text-gray-600">No assignments created yet.</p>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.map((assignment) => (
                                <li key={assignment.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h4>
                                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                                    <p className="text-sm text-gray-500">Due: {new Date(assignment.due_date).toLocaleString()}</p>
                                    <button
                                        onClick={() => handleViewSubmissionsClick(assignment.id)}
                                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                    >
                                        View Submissions ({assignment.submissions ? assignment.submissions.length : 0})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'viewSubmissions' && selectedAssignmentId && (
                <SubmissionViewer submissions={submissions} assignmentId={selectedAssignmentId} showMessage={showMessage} onBack={() => setActiveTab('viewAssignments')} />
            )}
        </div>
    );
};
export default TeacherDashboard;
