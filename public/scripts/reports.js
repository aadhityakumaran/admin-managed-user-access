const buttons = document.querySelectorAll('.action-button');

const handleAction = async (method, userid) => {
    try {
        const response = await fetch(`/admin/users/${userid}`, { method });
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        window.location.reload(true);
    } catch (err) {
        console.error(`Failed to perform ${requestType} requsest:`, err);
    }
}

buttons.forEach(button => {
    const { actionType, userid } = button.dataset;
    if (actionType === 'done' || actionType === 'delete') {
        const method = actionType === 'done' ? 'PUT' : 'DELETE';
        button.addEventListener('click', () => handleAction(method, userid));
    }
});

// Path: public/scripts/reports.js