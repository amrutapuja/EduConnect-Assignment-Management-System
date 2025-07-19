const AssignmentSubmissionForm = ({ token, assignment, onSubmissionSuccess, onBack, showMessage }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);

    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!submissionText && !submissionFile) {
            showMessage('Please provide either text or a file for submission.', 'error');
            return;
        }

        const formData = new FormData();
        if (submissionText) {
            formData.append('submission_text', submissionText);
        }
        if (submissionFile) {
            formData.append('file', submissionFile);
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/assignments/${assignment.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                onSubmissionSuccess();
            } else {
                const errorData = await response.json();
                showMessage(errorData.detail || 'Failed to submit assignment.', 'error');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            showMessage('Network error. Failed to submit assignment.', 'error');
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <button
                onClick={onBack}
                className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
            >
                &larr; Back to Assignments
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Submit Assignment: {assignment.title}</h3>
            <p className="text-gray-700 mb-4">{assignment.description}</p>
            <p className="text-sm text-gray-500 mb-6">Due: {new Date(assignment.due_date).toLocaleString()}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="submissionText">
                        Your Submission (Text)
                    </label>
                    <textarea
                        id="submissionText"
                        rows="6"
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your submission here..."
                    ></textarea>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="submissionFile">
                        Upload File (Optional)
                    </label>
                    <input
                        type="file"
                        id="submissionFile"
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={handleFileChange}
                    />
                    {submissionFile && <p className="mt-2 text-sm text-gray-600">Selected file: {submissionFile.name}</p>}
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
                >
                    Submit Assignment
                </button>
            </form>
        </div>
    );
};
