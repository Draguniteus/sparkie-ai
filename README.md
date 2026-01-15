# Sparkie - The Queen Bee's Chatbot Wrapper

🐝 A beautiful, bee-themed chatbot wrapper for Polleneer social network

## Quick Start

```bash
# Clone and setup
git clone https://github.com/your-username/sparkie-wrapper.git
cd sparkie-wrapper

# Copy environment file
cp backend/.env.example backend/.env
# Add your API keys to backend/.env

# Start with Docker Compose
docker-compose up -d

# Access at:
# - Frontend: http://localhost:3000
# - API Docs: http://localhost:8000/docs
```

## Project Structure

```
sparkie-wrapper/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── docker/            # Docker configurations
├── docs/              # Documentation
└── README.md
```

## Features

- 🤖 MiniMax API integration (M2.1 model)
- 🐝 Queen Bee personality (Sparkie)
- 💬 Real-time streaming chat
- 🎨 **FREE Image Generation** via ModelScope Z-Image-Turbo
- 🔐 JWT authentication
- 📱 Responsive bee-themed UI
- 🚀 Production-ready Docker setup

## 🎨 Image Generation

Sparkie includes **FREE image generation** powered by ModelScope! 

### Setup Image Generation

1. Get your free ModelScope API token:
   - Go to https://modelscope.cn/my
   - Navigate to API section
   - Copy your API token

2. Add to `backend/.env`:
   ```bash
   MODELSCOPE_API_KEY=your_token_here
   ```

3. Restart the application

### Usage

Just ask Sparkie to generate an image!

**Example prompts:**
- "Show me Sparkie"
- "Generate an image of a queen bee"
- "Draw a golden hive"
- "Create a picture of bees flying"

Sparkie will automatically detect image requests and generate beautiful images with a regal queen bee theme!

### API Endpoint

```http
POST /api/v1/generate/image
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A beautiful queen bee with golden crown",
  "size": "1024x1024",  // optional: 512x512, 768x768, 1024x1024, 1024x768, 768x1024
  "steps": 9  // optional: 1-50, default 9
}
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Customization Guide](docs/CUSTOMIZATION.md)

---

🐝 Made with love by Angel Michael (@WeGotHeaven)
