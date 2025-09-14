import express from "express"
import chalk from "chalk"
import fs from "fs"
import cors from "cors"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
let PORT = process.env.PORT || 3000

// Basic Express configuration
app.enable("trust proxy")
app.set("json spaces", 2)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  next()
})

// Rate limiting
const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 1 * 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per window

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
  } else {
    const data = requestCounts.get(ip)
    if (now > data.resetTime) {
      data.count = 1
      data.resetTime = now + RATE_LIMIT_WINDOW
    } else {
      data.count++
      if (data.count > RATE_LIMIT_MAX) {
        return res.status(429).json({
          info: "Development by RaolByte",
          code: 429,
          success: false,
          data: null,
          error: {
            status: "Too Many Requests",
            message: "Rate limit exceeded. Please try again later."
          }
        })
      }
    }
  }
  next()
})

// Clean up rate limit data periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

// Global JSON response wrapper
app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (data) {
    if (data && typeof data === "object") {
      const responseData = {
        info: "Development by RaolByte",
        code: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300,
        data: data.data || data,
        error: data.error || null,
        ...data
      }
      return originalJson.call(this, responseData)
    }
    return originalJson.call(this, data)
  }
  next()
})

// Home endpoint with specified response
app.get("/", (req, res) => {
  res.status(404).json({
    data: null,
    error: {
      status: "Not Found",
      message: "The requested resource could not be found."
    }
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "5.1.1"
    }
  })
})

// API info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    data: {
      name: "Raol-UI REST API",
      version: "5.1.1",
      description: "Minimalist plugin-based REST API framework",
      creator: "RaolByte",
      endpoints: {
        health: "/health",
        info: "/api/info",
        plugins: "/api/plugins"
      }
    }
  })
})

// Plugin system - load API routes dynamically
let totalRoutes = 0
const apiFolder = path.join(__dirname, "./src/api")

const loadApiRoutes = async () => {
  if (!fs.existsSync(apiFolder)) {
    console.log(chalk.yellow("API folder not found, creating basic structure..."))
    fs.mkdirSync(apiFolder, { recursive: true })
    return
  }

  const subfolders = fs.readdirSync(apiFolder)

  for (const subfolder of subfolders) {
    const subfolderPath = path.join(apiFolder, subfolder)
    if (fs.statSync(subfolderPath).isDirectory()) {
      const files = fs.readdirSync(subfolderPath)

      for (const file of files) {
        const filePath = path.join(subfolderPath, file)
        if (path.extname(file) === ".js") {
          try {
            const module = await import(pathToFileURL(filePath).href)
            const routeHandler = module.default
            if (typeof routeHandler === "function") {
              routeHandler(app)
              totalRoutes++
              console.log(
                chalk
                  .bgHex("#FFFF99")
                  .hex("#333")
                  .bold(` Loaded Route: ${path.basename(file)} `)
              )
            }
          } catch (error) {
            console.error(`Error loading route ${file}:`, error)
          }
        }
      }
    }
  }
}

// Load plugins endpoint
app.get("/api/plugins", (req, res) => {
  const plugins = []
  
  if (fs.existsSync(apiFolder)) {
    const subfolders = fs.readdirSync(apiFolder)
    
    for (const subfolder of subfolders) {
      const subfolderPath = path.join(apiFolder, subfolder)
      if (fs.statSync(subfolderPath).isDirectory()) {
        const files = fs.readdirSync(subfolderPath)
        const jsFiles = files.filter(file => path.extname(file) === ".js")
        
        if (jsFiles.length > 0) {
          plugins.push({
            category: subfolder,
            files: jsFiles,
            endpoints: jsFiles.map(file => `/${subfolder}/${file.replace('.js', '')}`)
          })
        }
      }
    }
  }

  res.json({
    data: {
      totalPlugins: plugins.length,
      totalRoutes: totalRoutes,
      plugins: plugins
    }
  })
})

// Load API routes
await loadApiRoutes()

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    data: null,
    error: {
      status: "Not Found",
      message: `The requested endpoint '${req.originalUrl}' could not be found.`
    }
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  res.status(err.status || 500).json({
    data: null,
    error: {
      status: "Internal Server Error",
      message: err.message || "An unexpected error occurred."
    }
  })
})

// Find available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve) => {
    const server = app
      .listen(startPort, () => {
        const port = server.address().port
        server.close(() => resolve(port))
      })
      .on("error", () => {
        resolve(findAvailablePort(startPort + 1))
      })
  })
}

// Start server
const startServer = async () => {
  try {
    PORT = await findAvailablePort(PORT)

    app.listen(PORT, () => {
      console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Raol-UI REST API Server is running on port ${PORT} `))
      console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Total Routes Loaded: ${totalRoutes} `))
      console.log(chalk.cyan(`\nAvailable endpoints:`))
      console.log(chalk.white(`  GET  /           - Home endpoint (404 response)`))
      console.log(chalk.white(`  GET  /health     - Health check`))
      console.log(chalk.white(`  GET  /api/info   - API information`))
      console.log(chalk.white(`  GET  /api/plugins - List loaded plugins`))
      console.log(chalk.white(`\nPure JSON responses - No frontend components`))
    })
  } catch (err) {
    console.error(chalk.bgRed.white(` Server failed to start: ${err.message} `))
    process.exit(1)
  }
}

startServer()

export default app