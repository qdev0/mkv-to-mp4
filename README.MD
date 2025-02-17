# MKV to MP4 Converter

A web-based tool that allows users to convert MKV video files to MP4 format directly in their browser. This project uses FFmpeg.wasm to handle video conversion client-side, meaning no files are uploaded to any server.

## Features

- Browser-based conversion (no server uploads needed)
- Simple, user-friendly interface
- Fast conversion using codec copying (no re-encoding if possible)
- Immediate download of converted files
- Progress status updates

## How It Works

The converter uses FFmpeg.wasm, a WebAssembly port of FFmpeg, to perform the conversion entirely in your browser. The conversion process:

1. Select an MKV file using the file picker
2. Click "Convert to MP4" to start the process
3. Wait for the conversion to complete
4. Download the converted MP4 file

## Technical Details

The project is built using:
- HTML5 for the user interface
- FFmpeg.wasm for video conversion
- Express.js for serving the application
- Modern JavaScript (async/await) for handling the conversion process

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Open your browser and navigate to `http://localhost:3000`

## Requirements

- A modern web browser that supports WebAssembly
- Sufficient RAM for video conversion (varies based on file size)
- Node.js and npm for running the local server

## Important Notes

- The conversion speed depends on your device's processing power
- Large files may take longer to process
- The converter uses codec copying when possible to maintain quality and speed
- Some MKV files might require re-encoding if their codecs aren't compatible with MP4

## License

This project is open source and available under the MIT License.