# MKV to MP4 Converter

A modern, web-based tool that allows users to convert MKV video files to MP4 format directly in their browser. This project uses FFmpeg.wasm for client-side video conversion, ensuring no files are uploaded to any server.

## Features

- 🎯 Browser-based conversion (no server uploads needed)
- 🎨 Modern, responsive interface with light/dark theme
- 📁 Drag & drop file support
- 📥 Multiple file upload capability
- 🔄 Queue system for batch processing
- 📊 Real-time conversion progress
- ⚡ Fast conversion using codec copying
- 🔍 File size validation
- 📱 Mobile-friendly design
- 🌙 Light/Dark theme support

## How It Works

The converter uses FFmpeg.wasm, a WebAssembly port of FFmpeg, to perform the conversion entirely in your browser:

1. Drag & drop or select MKV files
2. Files are added to the conversion queue
3. Watch real-time conversion progress
4. Download converted MP4 files with one click

## Technical Details

Built using:
- HTML5 and CSS3 for the user interface
- FFmpeg.wasm for video conversion
- Modern JavaScript (ES6+) features
- CSS Grid and Flexbox for responsive layout
- Font Awesome icons for better UX
- Local Storage for theme preference

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

- Modern web browser with WebAssembly support
- Sufficient RAM for video conversion (varies by file size)
- Node.js and npm for running the local server
- Maximum file size: 2GB per file

## Features in Detail

### User Interface
- Clean, modern design
- Intuitive drag & drop interface
- Progress bars for conversion status
- Download buttons for completed conversions
- Light/Dark theme toggle
- Responsive design for all screen sizes

### Conversion Queue
- Multiple file processing
- Real-time progress tracking
- Status indicators (pending, converting, completed, error)
- File size display
- Estimated time remaining

### Performance
- Client-side processing
- Stream copying when possible (no re-encoding)
- Efficient memory management
- Automatic cleanup after conversion

## Important Notes

- Conversion speed depends on your device's processing power
- Large files may take longer to process
- The converter uses codec copying when possible to maintain quality and speed
- Some MKV files might require re-encoding if their codecs aren't compatible with MP4

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.