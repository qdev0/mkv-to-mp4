const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

convertBtn.addEventListener('click', async () => {
  // Make sure a file has been selected
  if (fileInput.files.length === 0) {
    alert('Please select an MKV file first.');
    return;
  }

  const file = fileInput.files[0];
  const { name } = file;
  
  try {
    // Load FFmpeg if not already loaded
    statusEl.textContent = 'Loading FFmpeg...';
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    statusEl.textContent = 'Converting... This may take a while.';

    // Write the MKV file to the FFmpeg file system
    ffmpeg.FS('writeFile', name, await fetchFile(file));

    // Extract base filename (remove .mkv extension)
    const outputName = name.substring(0, name.lastIndexOf('.')) || name;

    // Run FFmpeg to convert MKV -> MP4
    // Using "copy" so it does not re-encode (if codecs are already compatible)
    await ffmpeg.run('-i', name, '-c:v', 'copy', '-c:a', 'copy', `${outputName}.mp4`);

    // Read the result from the FFmpeg file system
    const data = ffmpeg.FS('readFile', `${outputName}.mp4`);

    // Create a Blob from the data and generate a download link
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    
    downloadLink.href = url;
    downloadLink.download = `${outputName}.mp4`;
    downloadLink.style.display = 'inline-block';
    downloadLink.textContent = `Download ${outputName}.mp4`;

    statusEl.textContent = 'Conversion complete!';
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'An error occurred during conversion.';
  }
});
