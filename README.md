# Raol-UI REST API v5.1.1

Minimalist plugin-based REST API framework. Pure JSON responses, no UI components.

## Features

- **Pure JSON Responses**: All endpoints return structured JSON data
- **Plugin-Based Architecture**: Add new endpoints by creating simple JavaScript files
- **Rate Limiting**: Built-in rate limiting (100 requests per minute)
- **Security Headers**: Automatic security headers for all responses
- **Health Monitoring**: Built-in health check and monitoring endpoints
- **Error Handling**: Consistent error response format
- **API Key Authentication**: Built-in API key middleware

## Quick Start

```bash
npm install
npm start
```

## Available Endpoints

### Home
```
GET /
```
API information and available endpoints.

### Health Check
```
GET /health
```
Server health status with detailed uptime, memory usage, and system info.

### Plugin List
```
GET /api/plugins
```
List of loaded plugins with endpoint details and parameters.

## Built-in APIs

### Random Images
- **GET** `/random/ba` - Random Blue Archive character images

### Image Makers
- **GET** `/maker/brat` - Generate BRAT-style text images
  - `text` (required) - Text to be inserted
  - `background` (optional) - Background color in hex format
  - `color` (optional) - Text color in hex format

- **GET** `/maker/bratvid` - Generate BRAT-style text videos
  - `text` (required) - Text to be inserted
  - `background` (optional) - Background color in hex format
  - `color` (optional) - Text color in hex format

## Response Format

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

## Creating Plugins

Create JavaScript files in `src/api/category/`:

```javascript
export default function(app) {
  app.get("/api/example/endpoint", (req, res) => {
    res.json({
      data: {
        message: "Hello from plugin!",
        timestamp: new Date().toISOString()
      }
    })
  })
}
```

## Rate Limiting

100 requests per minute per IP address.

## Security

- CORS enabled
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- API key authentication available

## License

MIT License - Developed by RaolByte