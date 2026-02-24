document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');

    const uploadContent = document.querySelector('.upload-content');
    const previewContent = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');

    const resetBtn = document.getElementById('reset-btn');
    const predictBtn = document.getElementById('predict-btn');

    const resultArea = document.getElementById('result-area');
    const loader = document.getElementById('loader');
    const resultContent = document.getElementById('result-content');
    const errorContent = document.getElementById('error-content');

    let currentFile = null;

    // Trigger file input dialog on browse click
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card click issue
        fileInput.click();
    });

    // Make entire drop area clickable
    dropArea.addEventListener('click', () => {
        if (!currentFile) {
            fileInput.click();
        }
    });

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        if (!currentFile) dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                currentFile = file;
                showPreview(file);
            } else {
                alert('이미지 파일만 업로드 가능합니다.');
            }
        }
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            imagePreview.src = reader.result;
            uploadContent.classList.add('hidden');
            previewContent.classList.remove('hidden');
            dropArea.style.cursor = 'default';
            // Hide result area if a new image is selected
            resultArea.classList.add('hidden');
        }
    }

    resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentFile = null;
        fileInput.value = '';
        uploadContent.classList.remove('hidden');
        previewContent.classList.add('hidden');
        dropArea.style.cursor = 'pointer';
        resultArea.classList.add('hidden');
    });

    predictBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!currentFile) return;

        // Reset UI
        resultArea.classList.remove('hidden');
        loader.classList.remove('hidden');
        resultContent.classList.add('hidden');
        errorContent.classList.add('hidden');

        // Scroll to result slightly if needed
        setTimeout(() => {
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            loader.classList.add('hidden');

            if (data.success) {
                showResult(data);
            } else {
                showError(data.error || '서버 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('Error:', error);
            loader.classList.add('hidden');
            showError('서버에 연결할 수 없습니다.');
        }
    });

    function showResult(data) {
        resultContent.classList.remove('hidden');

        const badge = document.getElementById('prediction-badge');
        const textElement = document.getElementById('prediction-text');
        const confTextElement = document.getElementById('confidence-text');
        const fillElement = document.getElementById('confidence-fill');

        textElement.textContent = data.prediction;
        confTextElement.textContent = data.confidence;

        // Remove existing classes
        badge.classList.remove('cat', 'dog');

        // Add respective class
        if (data.prediction === 'Cat') {
            badge.classList.add('cat');
            fillElement.style.background = 'linear-gradient(90deg, #f43f5e, #fb923c)';
        } else {
            badge.classList.add('dog');
            fillElement.style.background = 'linear-gradient(90deg, #3b82f6, #06b6d4)';
        }

        // Animate fill bar
        setTimeout(() => {
            fillElement.style.width = data.confidence;
        }, 50);
    }

    function showError(message) {
        errorContent.classList.remove('hidden');
        document.getElementById('error-text').textContent = message;
    }
});
