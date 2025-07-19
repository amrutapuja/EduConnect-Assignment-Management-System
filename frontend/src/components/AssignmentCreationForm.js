// components/AssignmentCreationForm.js
import React, { useState } from 'react';

const AssignmentCreationForm = ({ token, showMessage, onAssignmentCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(''); // YYYY-MM-DDTHH:MM format

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    due_date: new Date(dueDate).toISOString(), // Convert to ISO 8601 for FastAPI
                }),
            });

            if (response.ok) {
                showMessage('Assignment created successfully!', 'success');
                setTitle('');
                setDescription('');
                setDueDate('');
                onAssignmentCreated(); // Notify parent to refresh list or change tab
            } else {
                const errorData = await response.json();
                showMessage(errorData.detail || 'Failed to create assignment.', 'error');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            showMessage('Network error. Failed to create assignment.', 'error');
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Create New Assignment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows="4"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                        Due Date and Time
                    </label>
                    <input
                        type="datetime-local"
                        id="dueDate"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
                >
                    Create Assignment
                </button>
            </form>
        </div>
    );
};
export default AssignmentCreationForm;
