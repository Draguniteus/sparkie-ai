# Deploying Sparkie to DigitalOcean App Platform

## Prerequisites

1. **DigitalOcean Account** with App Platform enabled
2. **MiniMax API Key** - Get from https://api.minimax.chat/
3. **Git repository** with your Sparkie code

## Deployment Steps

### 1. Deploy Backend Component

1. Go to DigitalOcean App Platform
2. Click "Create App" → "GitHub"
3. Select your repository
4. Choose "Python" as the language
5. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Add Environment Variables:
   - `MINIMAX_API_KEY` = your_api_key
   - `JWT_SECRET_KEY` = generate_secure_key
   - `DATABASE_URL` = postgresql://...
7. Click "Launch"

### 2. Deploy Frontend Component

1. Go to DigitalOcean App Platform
2. Click "Create App" → "GitHub"
3. Select your repository
4. Choose "Node.js" as the language
5. Configure:
   - Build Command: `npm run build`
   - Run Command: `npm start`
6. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your_backend_url/api/v1
7. Click "Launch"

### 3. Configure CORS

Update `ALLOWED_ORIGINS` in your backend `.env`:
```bash
ALLOWED_ORIGINS=https://your-frontend-app.ondigitalocean.app
```

## Production Checklist

- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up Redis for caching and rate limiting
- [ ] Configure custom domain
- [ ] Set up SSL certificates (automatic on App Platform)
- [ ] Monitor with DigitalOcean logs
- [ ] Set up alerts for errors

## Rollback

To rollback a deployment:
1. Go to your App in DigitalOcean
2. Click "Deployments" tab
3. Select previous deployment
4. Click "Redeploy"

## Troubleshooting

### 502 Bad Gateway
- Check backend health: `https://your-backend.ondigitalocean.app/health`
- Verify environment variables are set
- Check logs in DigitalOcean dashboard

### CORS Errors
- Update `ALLOWED_ORIGINS` in backend environment
- Ensure frontend URL is correct

### Database Connection Issues
- Use PostgreSQL component in App Platform
- Verify `DATABASE_URL` format
