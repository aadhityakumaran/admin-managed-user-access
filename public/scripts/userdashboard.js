const imageActivity = document.getElementById('image-activity');
const submitButton = document.getElementById('submit-button');
const nameInput = document.getElementById('name');
const viewButtons = document.getElementsByClassName('view-button');
const overlay = document.getElementById('overlay');
const viewWindow = document.getElementById('view-window');

let imageDataURL = null;

function highlight(event) {
    event.preventDefault();
    if (event.dataTransfer.types.includes('Files')) {
        event.target.classList.add('highlight');
    }
}

function unhighlight(event) {
    event.target.classList.remove('highlight');
}

function handleDropEvent(event) {
    event.preventDefault();
    event.target.classList.remove('highlight');
    if (event.dataTransfer.types.includes('Files') && event.dataTransfer.files.length === 1) {
        handleFile(event.dataTransfer.files[0]);
    }
}

function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageActivity.innerHTML = '';

            const img = document.createElement('img');
            img.src = e.target.result;
            imageActivity.appendChild(img);
            img.addEventListener('load', handleLoadEvent);

            submitButton.innerHTML = 'Crop';
            submitButton.onclick = getImage;
        };
        reader.readAsDataURL(file);
    }
}

let cropper;
function handleLoadEvent(event) {
    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(event.target, {
        aspectRatio: 1,
        viewMode: 2,
    });
}

function getImage() {
    const canvas = cropper.getCroppedCanvas();
    const dataUrl = canvas.toDataURL();
    const img = document.createElement('img');
    imageDataURL = dataUrl;
    img.src = dataUrl;
    imageActivity.innerHTML = '';
    imageActivity.appendChild(img);
    submitButton.innerHTML = 'Upload';
    submitButton.onclick = handleSubmit;
}

async function handleSubmit() {
    const formData = new FormData();
    formData.append('name', nameInput.value);
    if (imageDataURL) {
        const type = imageDataURL.split(';')[0].split(':')[1];
        
        const res = await fetch(imageDataURL);
        const blob = await res.blob();
        const file = new File([blob], `file`, { type: type });
        formData.append('image', file);
    }
    try {
        const res = await fetch('/', {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            alert('Data uploaded successfully');
        }
    } catch (error) {
        console.error(error);
    }
    window.location.reload(true);
}

for (const button of viewButtons) {
    button.onclick = () => {
        overlay.classList.toggle('show');
        viewWindow.classList.toggle('hide');
    }
}