# DeepCanvasAI: Multimodal AI Application Suite

DeepCanvasAI is a comprehensive AI application suite built on the Gemini 2.0 Flash Multimodal Live API. It provides real-time interaction with Gemini's API through text, audio, video, and screen sharing capabilities, along with additional features for content creation and social media management.

## Features

- **Main Application**: Real-time chat with Gemini 2.0 Flash Multimodal Live API
- **Second Me Demo**: Integration with Second Me for personalized AI interactions
- **Creation Studio**: Tools for AI-assisted content creation
- **Social Station**: Social media management and content scheduling
- **Veo2 Test**: Video enhancement and processing capabilities
- **Additional Features**:
  - Real-time audio responses from the model
  - Real-time audio input from the user, allowing interruptions
  - Real-time video streaming from the user's webcam
  - Real-time screen sharing from the user's screen
  - Function calling
  - Transcription of the model's audio (with Deepgram API)
  - Mobile-friendly interface

## Getting Started

### Prerequisites

- Modern web browser with WebRTC, WebSocket, and Web Audio API support
- Google AI Studio API key for Gemini
- Deepgram API key (optional, for transcription)
- Veo2 access token (optional, for video enhancement)

### Installation Options

#### Option 1: Local Development Server

1. Clone the repository:
   ```bash
   git clone https://github.com/R3n3gade-ai/DeepCanvasAI.git
   ```

2. Navigate to the project directory:
   ```bash
   cd DeepCanvasAI
   ```

3. Start a local development server using one of these methods:
   - Python:
     ```bash
     python -m http.server 8000
     ```
   - Node.js:
     ```bash
     npx http-server 8000
     ```
   - VS Code: Use the Live Server extension

4. Access the application at `http://localhost:8000`

#### Option 2: GitHub Pages Deployment

1. Fork the repository on GitHub
2. Go to the repository settings
3. Navigate to the "Pages" section
4. Select the branch you want to deploy (usually `main` or `master`)
5. Save the settings and wait for the deployment to complete
6. Access your application at `https://[your-username].github.io/DeepCanvasAI`

#### Option 3: Netlify/Vercel Deployment

1. Create an account on [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)
2. Connect your GitHub account
3. Select the DeepCanvasAI repository
4. Deploy the application with default settings
5. Access your application at the provided domain

### Configuration

1. Open the application in your browser
2. Click on the settings icon (⚙️) in the top right corner
3. Enter your API keys:
   - **Gemini API Key**: Required for all AI interactions
   - **Deepgram API Key**: Optional, for real-time transcription
   - **Veo2 Access Token**: Optional, for video enhancement features
4. Click "Save" to store your settings

## Using the Application

### Main Application (index.html)
- Access the main chat interface
- Use text input or microphone for conversations
- Enable camera for video input
- Share your screen for visual context

### Second Me Demo (second-me-demo.html)
- Experience personalized AI interactions
- Train the AI with your preferences and style
- Create a digital twin for consistent interactions

### Creation Studio (creation-studio.html)
- Generate content ideas
- Create drafts for articles, social media posts, etc.
- Edit and refine AI-generated content

### Social Station (social-station.html)
- Manage social media content
- Schedule posts across platforms
- Analyze engagement metrics

### Veo2 Test (veo2-test.html)
- Test video enhancement capabilities
- Process and improve video quality
- Apply filters and effects

## Troubleshooting

### API Key Issues
- Ensure your API keys are entered correctly in the settings
- Check that your API keys have the necessary permissions
- Verify that you haven't exceeded API usage limits

### Browser Compatibility
- Use the latest version of Chrome, Firefox, or Edge
- Enable JavaScript and cookies
- Allow camera and microphone permissions when prompted

### Connection Problems
- Check your internet connection
- Ensure your firewall isn't blocking WebSocket connections
- Try disabling VPN services if you're using them

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
