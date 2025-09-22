import axios from "axios"
import { createApiKeyMiddleware } from "../../middleware/apikey.js"

export default (app) => {
  async function getBratImage(text) {
    try {
      const encodedText = encodeURIComponent(text)
      const urls = [
        `https://aqul-brat.hf.space/?text=${encodedText}`,
        `https://api-faa-skuarta2.vercel.app/faa/brathd?text=${encodedText}`,
      ]
      const shuffledUrls = urls.sort(() => Math.random() - 0.5)
      let imageBuffer = null

      for (let url of shuffledUrls) {
        try {
          console.log(`[INFO] Mencoba URL (acak): ${url}`)
          const response = await axios.get(url, { responseType: 'arraybuffer' })
          imageBuffer = Buffer.from(response.data)
          if (imageBuffer && imageBuffer.length > 0) {
            console.log('[SUCCESS] Gambar berhasil diambil.')
            break
          }
        } catch (err) {
          console.warn(`[WARN] Gagal mengambil gambar dari: ${url} - ${err.message}`)
        }
      }

      if (!imageBuffer) {
        throw new Error('Semua API gagal digunakan.')
      }

      return imageBuffer
    } catch (error) {
      throw error
    }
  }

  async function getBratVideo(text) {
    try {
      const url = `https://skyzxu-brat.hf.space/brat-animated?text=${encodeURIComponent(text)}`
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return Buffer.from(response.data)
    } catch (error) {
      throw error
    }
  }
  app.get('/api/maker/brat', createApiKeyMiddleware(), async (req, res) => {
    try {
      const text = req.query.text || req.body?.text

      if (!text) {
        return res.status(400).json({ status: false, error: 'Text is required' })
      }

      const imageBuffer = await getBratImage(text)

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
      })
      res.end(imageBuffer)
    } catch (error) {
      console.error('[ERROR] ' + error.message)
      res.status(500).json({
        status: false,
        error: error.message || 'Failed to generate BRAT image',
      })
    }
  })

  app.post('/api/maker/brat', createApiKeyMiddleware(), async (req, res) => {
    try {
      const text = req.query.text || req.body?.text

      if (!text) {
        return res.status(400).json({ status: false, error: 'Text is required' })
      }

      const imageBuffer = await getBratImage(text)

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
      })
      res.end(imageBuffer)
    } catch (error) {
      console.error('[ERROR] ' + error.message)
      res.status(500).json({
        status: false,
        error: error.message || 'Failed to generate BRAT image',
      })
    }
  })

  // Endpoint untuk video BRAT
  app.get('/api/maker/bratvideo', createApiKeyMiddleware(), async (req, res) => {
    try {
      const text = req.query.text || req.body?.text

      if (!text) {
        return res.status(400).json({ status: false, error: 'Text is required' })
      }

      const videoBuffer = await getBratVideo(text)

      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length,
      })
      res.end(videoBuffer)
    } catch (error) {
      console.error('[ERROR] ' + error.message)
      res.status(500).json({
        status: false,
        error: error.message || 'Failed to generate BRAT video',
      })
    }
  })

  app.post('/api/maker/bratvideo', createApiKeyMiddleware(), async (req, res) => {
    try {
      const text = req.query.text || req.body?.text

      if (!text) {
        return res.status(400).json({ status: false, error: 'Text is required' })
      }

      const videoBuffer = await getBratVideo(text)

      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length,
      })
      res.end(videoBuffer)
    } catch (error) {
      console.error('[ERROR] ' + error.message)
      res.status(500).json({
        status: false,
        error: error.message || 'Failed to generate BRAT video',
      })
    }
  })
}
