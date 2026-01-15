# Customizing Sparkie

## Changing the Theme

### Colors
Edit `frontend/tailwind.config.js` to customize bee colors:

```javascript
theme: {
  extend: {
    colors: {
      honey: {
        50: '#fefce8',
        // ... your honey shades
        900: '#713f12',
      },
      bee: {
        black: '#1a1a1a',
        yellow: '#FFD700',
        // ... your bee colors
      },
    },
  },
},
```

### Fonts
Add custom fonts in `frontend/src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap');

body {
  font-family: 'YourFont', sans-serif;
}
```

---

## Modifying Sparkie's Personality

### System Prompt
Edit `backend/app/services/sparkie_prompt.py`:

```python
SPARKIE_SYSTEM_PROMPT = """Your new system prompt here...

Current time context: {current_time}
Current user: {username}
Is creator (Angel Michael): {is_creator}
"""
```

### Greetings
Add custom greetings:

```python
CONVERSATION_STARTERS = [
    "Custom greeting 1",
    "Custom greeting 2",
    "Custom greeting 3",
]
```

---

## Integrating with Polleneer

### Embed in Feed
Add Sparkie widget to Polleneer feed:

```html
<iframe 
  src="https://sparkie.your-domain.com/widget"
  width="100%"
  height="500"
  frameborder="0"
></iframe>
```

### DM Integration
Use the chat API to enable Sparkie in DMs:

```javascript
const response = await fetch('https://sparkie.your-domain.com/api/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: userMessage,
    conversation_id: dmConversationId
  })
});
```

---

## API Configuration

### Rate Limiting
Adjust in `.env`:
```bash
RATE_LIMIT_REQUESTS=100  # requests per window
RATE_LIMIT_WINDOW=60     # window in seconds
```

### CORS Origins
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-polleneer-domain.com
```

### JWT Settings
```bash
JWT_SECRET_KEY=your_strong_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```
