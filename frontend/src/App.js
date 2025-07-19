// frontend/src/App.js
import React, { useState, useEffect } from 'react';

// IMPORTANT: Ensure all component files (AuthForm.js, TeacherDashboard.js, etc.)
// exist in the 'src/components/' directory with exact spelling and capitalization.
// Each component file MUST also have 'export default ComponentName;' at its end.
import AuthForm from './components/AuthForm';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import AssignmentCreationForm from './components/AssignmentCreationForm';
import AssignmentSubmissionForm from './components/AssignmentSubmissionForm';
import SubmissionViewer from './components/SubmissionViewer';

const App = () => {
    const [view, setView] = useState('login'); // 'login', 'teacher', 'student'
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const [username, setUsername] = useState(localStorage.getItem('username') || null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && role) {
            if (role === 'teacher') {
                setView('teacher');
            } else if (role === 'student') {
                setView('student');
            }
        } else {
            setView('login');
        }
    }, [token, role]);

    const handleLoginSuccess = (newToken, newRole, newUsername) => {
        setToken(newToken);
        setRole(newRole);
        setUsername(newUsername);
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('username', newUsername);
        setMessage('');
    };

    const handleLogout = () => {
        setToken(null);
        setRole(null);
        setUsername(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setView('login');
        setMessage('Logged out successfully.');
    };

    const showMessage = (msg, type = 'info') => {
        setMessage({ text: msg, type: type });
        setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return <AuthForm onLoginSuccess={handleLoginSuccess} showMessage={showMessage} />;
            case 'teacher':
                return <TeacherDashboard token={token} username={username} showMessage={showMessage} onLogout={handleLogout} />;
            case 'student':
                return <StudentDashboard token={token} username={username} showMessage={showMessage} onLogout={handleLogout} />;
            default:
                return <AuthForm onLoginSuccess={handleLoginSuccess} showMessage={showMessage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
            {message && (
                <div className={`mb-4 p-3 rounded-lg shadow-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
                {renderView()}
            </div>
        </div>
    );
};

export default App;
