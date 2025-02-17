const { createFFmpeg, fetchFile } = FFmpeg;

// FFmpeg instance
let ffmpeg = null;
let ffmpegLoaded = false;

// Queue management
let conversionQueue = [];
let isConverting = false;

// DOM elements
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');
const themeToggle = document.getElementById('themeToggle');

// Initialize FFmpeg
async function initFFmpeg() {
    try {
        ffmpeg = createFFmpeg({
            log: true,
            progress: ({ ratio }) => {
                if (conversionQueue.length > 0 && isConverting) {
                    const progress = Math.round(ratio * 100);
                    updateQueueItemProgress(conversionQueue[0], progress);
                }
            }
        });

        await ffmpeg.load();
        ffmpegLoaded = true;
        console.log('FFmpeg loaded');
    } catch (error) {
        console.error('FFmpeg loading failed:', error);
        showError('Failed to load conversion tool. Please refresh the page.');
    }
}

// Initialize the application
async function init() {
    initTheme();
    await initFFmpeg();
    setupEventListeners();
}

function setupEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.name.toLowerCase().endsWith('.mkv'));
        addFilesToQueue(files);
    });

    // File input handler
    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        addFilesToQueue(files);
        fileInput.value = ''; // Reset input
    });

    // Theme switcher
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function addFilesToQueue(files) {
    files.forEach(file => {
        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
            showError(`File ${file.name} is too large. Maximum size is 2GB.`);
            return;
        }

        const queueItem = {
            id: Date.now() + Math.random(),
            file: file,
            status: 'pending',
            progress: 0
        };

        conversionQueue.push(queueItem);
        addQueueItemToDOM(queueItem);
    });

    updateStats();
    if (!isConverting) {
        processQueue();
    }
}

function addQueueItemToDOM(queueItem) {
    const queueList = document.getElementById('queueList');
    const itemElement = document.createElement('div');
    itemElement.className = 'queue-item';
    itemElement.id = `queue-item-${queueItem.id}`;

    itemElement.innerHTML = `
        <div class="file-info">
            <div class="file-name">${queueItem.file.name}</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${queueItem.progress}%"></div>
            </div>
            <div class="file-size">${formatFileSize(queueItem.file.size)}</div>
        </div>
        <div class="status ${queueItem.status}">${capitalizeFirst(queueItem.status)}</div>
        <button class="download-btn" style="display: none;">
            <i class="fas fa-download"></i> Download
        </button>
    `;

    queueList.appendChild(itemElement);
}

async function processQueue() {
    if (!ffmpegLoaded || conversionQueue.length === 0 || isConverting) {
        return;
    }

    isConverting = true;
    const queueItem = conversionQueue[0];
    updateQueueItemStatus(queueItem, 'converting');

    try {
        await convertFile(queueItem);
        updateQueueItemStatus(queueItem, 'completed');
    } catch (error) {
        console.error('Conversion error:', error);
        updateQueueItemStatus(queueItem, 'error');
    }

    conversionQueue.shift(); // Remove processed item
    isConverting = false;
    updateStats();

    // Process next file if queue not empty
    if (conversionQueue.length > 0) {
        processQueue();
    }
}

async function convertFile(queueItem) {
    const inputFileName = queueItem.file.name;
    const outputFileName = inputFileName.replace('.mkv', '.mp4');

    try {
        // Read the file using fetchFile
        const fileData = await fetchFile(queueItem.file);
        // Write the file using FS.writeFile
        await ffmpeg.FS('writeFile', inputFileName, fileData);

        // Run conversion
        await ffmpeg.run(
            '-i', inputFileName,
            '-c', 'copy', // Copy streams without re-encoding
            outputFileName
        );

        // Read the converted file from FS
        const data = await ffmpeg.FS('readFile', outputFileName);

        // Store the converted file data in the queue item
        queueItem.convertedData = data.buffer;
        queueItem.outputFileName = outputFileName;

        // Clean up files from memory
        ffmpeg.FS('unlink', inputFileName);
        ffmpeg.FS('unlink', outputFileName);

        // Show download button
        const element = document.getElementById(`queue-item-${queueItem.id}`);
        if (element) {
            const downloadBtn = element.querySelector('.download-btn');
            downloadBtn.style.display = 'inline-flex';
            downloadBtn.addEventListener('click', () => downloadFile(queueItem));
        }
    } catch (error) {
        console.error('Conversion error:', error);
        throw error;
    }
}

function downloadFile(queueItem) {
    if (!queueItem.convertedData) {
        showError('Converted file data not found');
        return;
    }

    const blob = new Blob([queueItem.convertedData], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = queueItem.outputFileName;
    a.click();
    URL.revokeObjectURL(url);
}

function updateQueueItemStatus(queueItem, status) {
    queueItem.status = status;
    const element = document.getElementById(`queue-item-${queueItem.id}`);
    if (element) {
        const statusElement = element.querySelector('.status');
        statusElement.className = `status ${status}`;
        statusElement.textContent = capitalizeFirst(status);
    }
}

function updateQueueItemProgress(queueItem, progress) {
    queueItem.progress = progress;
    const element = document.getElementById(`queue-item-${queueItem.id}`);
    if (element) {
        const progressBar = element.querySelector('.progress');
        progressBar.style.width = `${progress}%`;
    }
}

function updateStats() {
    document.getElementById('queueCount').textContent = conversionQueue.length;
    const completedCount = document.querySelectorAll('.status.completed').length;
    document.getElementById('completedCount').textContent = completedCount;

    // Update estimated time
    const avgTimePerFile = 2; // minutes (estimated)
    const remainingTime = conversionQueue.length * avgTimePerFile;
    document.getElementById('estimatedTime').textContent =
        remainingTime > 0 ? `${remainingTime}min` : '--:--';
}

// Utility functions
function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
    // You can implement a more sophisticated error notification system
    alert(message);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize the application when the page loads
window.addEventListener('load', init);
