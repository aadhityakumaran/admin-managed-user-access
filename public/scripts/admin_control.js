function createUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    fetch('/admin/users', {
        method: 'POST',
        body: formData,
    }).then(response => {
        if (response.status === 400) {
            alert('User already exists');
        } else if (response.ok) {
            form.reset();
            alert('User created');
        } else {
            alert('Server error');
        }
    });
}