// components/AuthForm.js
import React, { useState } from 'react';

const AuthForm = ({ onLoginSuccess, showMessage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role for signup

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLogin ? 'http://127.0.0.1:8000/login' : 'http://127.0.0.1:8000/signup';
        const method = 'POST';
        const body = isLogin ? { username, password } : { username, password, role };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    onLoginSuccess(data.access_token, data.role, data.username);
                    showMessage('Login successful!', 'success');
                } else {
                    showMessage('Signup successful! Please log in.', 'success');
                    setIsLogin(true); // Switch to login form after successful signup
                }
            } else {
                showMessage(data.detail || 'An error occurred.', 'error');
            }
        } catch (error) {
            console.error('Auth error:', error);
            showMessage('Network error. Please try again.', 'error');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {!isLogin && (
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
                >
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </form>
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
    );
};
export default AuthForm;
