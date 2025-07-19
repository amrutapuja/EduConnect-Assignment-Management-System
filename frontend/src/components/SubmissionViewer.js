
import React, { useState } from 'react';

const SubmissionViewer = ({ submissions, assignmentId, showMessage, onBack }) => {
    const [submissionDetails, setSubmissionDetails] = useState(null); 

    const fetchSubmissionDetails = async (submissionId) => {
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch(`http://127.0.0.1:8000/submissions/${submissionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissionDetails(data);
            } else {
                showMessage('Failed to fetch submission details.', 'error');
            }
        } catch (error) {
            console.error('Error fetching submission details:', error);
            showMessage('Network error fetching submission details.', 'error');
        }
    };

    const handleViewDetails = (submissionId) => {
        fetchSubmissionDetails(submissionId);
    };

    const handleDownloadFile = (filePath) => {
        
        const fileUrl = `http://127.0.0.1:8000/${filePath}`; 
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <button
                onClick={() => {
                    onBack();
                    setSubmissionDetails(null); // Clear details when going back
                }}
                className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
            >
                &larr; Back to Assignments
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Submissions for Assignment ID: {assignmentId}</h3>

            {submissionDetails ? (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Submission Details (ID: {submissionDetails.id})</h4>
                    <p className="text-gray-700 mb-2"><strong>Student ID:</strong> {submissionDetails.student_id}</p>
                    <p className="text-gray-700 mb-2"><strong>Submitted At:</strong> {new Date(submissionDetails.submitted_at).toLocaleString()}</p>
                    {submissionDetails.submission_text && (
                        <div className="mb-2">
                            <h5 className="font-semibold text-gray-800">Submission Text:</h5>
                            <p className="bg-gray-100 p-3 rounded-md text-gray-700 whitespace-pre-wrap">{submissionDetails.submission_text}</p>
                        </div>
                    )}
                    {submissionDetails.file_path && (
                        <div className="mt-4">
                            <h5 className="font-semibold text-gray-800">Submitted File:</h5>
                            <button
                                onClick={() => handleDownloadFile(submissionDetails.file_path)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Download File
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setSubmissionDetails(null)}
                        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Back to All Submissions
                    </button>
                </div>
            ) : (
                <>
                    {submissions.length === 0 ? (
                        <p className="text-gray-600">No submissions for this assignment yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {submissions.map((submission) => (
                                <li key={submission.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">Submission ID: {submission.id}</p>
                                        <p className="text-gray-700">Student ID: {submission.student_id}</p>
                                        <p className="text-sm text-gray-500">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(submission.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                    >
                                        View Details
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};
export default SubmissionViewer;
