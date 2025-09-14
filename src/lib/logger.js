import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logDir = path.join(__dirname, "../logs")
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)

const writeLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    data
  }
  
  const logLine = JSON.stringify(logEntry) + '\n'
  
  fs.appendFileSync(logFile, logLine)
}

export const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`)
    writeLog('INFO', message, data)
  },
  
  error: (message, data) => {
    console.error(`[ERROR] ${message}`)
    writeLog('ERROR', message, data)
  },
  
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`)
    writeLog('WARN', message, data)
  },
  
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`)
    writeLog('DEBUG', message, data)
  }
}

export default logger