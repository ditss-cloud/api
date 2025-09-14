# Raol-UI REST API v5.1.1

A minimalist plugin-based REST API framework with pure JSON responses and no UI components.

## Features

- **Pure JSON Responses**: All endpoints return structured JSON data
- **Plugin-Based Architecture**: Add new endpoints by creating simple JavaScript files
- **Rate Limiting**: Built-in rate limiting (100 requests per minute)
- **Security Headers**: Automatic security headers for all responses
- **Health Monitoring**: Built-in health check and monitoring endpoints
- **Error Handling**: Consistent error response format

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode with auto-reload
npm run dev
```

## Default Endpoints

### Home Endpoint
```
GET /
```
Returns a 404 response with the specified format:
```json
{
  "info": "Development by RaolByte",
  "code": 404,
  "success": false,
  "data": null,
  "error": {
    "status": "Not Found",
    "message": "The requested resource could not be found."
  }
}
```

### Health Check
```
GET /health
```
Returns server health status:
```json
{
  "info": "Development by RaolByte",
  "code": 200,
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "version": "5.1.1"
  },
  "error": null
}
```

### API Information
```
GET /api/info
```
Returns API information and available endpoints.

### Plugin List
```
GET /api/plugins
```
Returns list of loaded plugins and their endpoints.

## Creating Plugins

To add new endpoints, create JavaScript files in the `src/api/` directory:

### Plugin Structure
```
src/api/
  ├── category-name/
  │   ├── endpoint-name.js
  │   └── another-endpoint.js
  └── another-category/
      └── endpoint.js
```

### Plugin Example
Create `src/api/example/my-plugin.js`:

```javascript
export default function(app) {
  // GET endpoint
  app.get("/api/example/my-endpoint", (req, res) => {
    res.json({
      data: {
        message: "Hello from my plugin!",
        timestamp: new Date().toISOString()
      }
    })
  })

  // POST endpoint
  app.post("/api/example/my-endpoint", (req, res) => {
    res.json({
      data: {
        received: req.body,
        timestamp: new Date().toISOString()
      }
    })
  })
}
```

## Response Format

All responses follow this consistent format:

```json
{
  "info": "Development by RaolByte",
  "code": 200,
  "success": true,
  "data": {
    // Your actual data here
  },
  "error": null
}
```

### Error Response Format
```json
{
  "info": "Development by RaolByte",
  "code": 400,
  "success": false,
  "data": null,
  "error": {
    "status": "Bad Request",
    "message": "Invalid parameters provided"
  }
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Response**: 429 status code when exceeded
- **Window**: 1 minute rolling window

## Security

- Automatic security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CORS enabled for cross-origin requests
- Trust proxy enabled for accurate IP detection

## Development

The framework automatically loads all `.js` files from the `src/api/` directory structure. Simply create new files and restart the server (or use `npm run dev` for auto-reload).

## License

MIT License - Developed by RaolByte