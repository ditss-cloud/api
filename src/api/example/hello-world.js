export default function(app) {
  // Simple hello world endpoint
  app.get("/api/example/hello", (req, res) => {
    const { name = "World" } = req.query
    
    res.json({
      data: {
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
        endpoint: "/api/example/hello"
      }
    })
  })

  // Echo endpoint - returns whatever data is sent
  app.post("/api/example/echo", (req, res) => {
    res.json({
      data: {
        received: req.body,
        timestamp: new Date().toISOString(),
        method: "POST"
      }
    })
  })

  // Random number generator
  app.get("/api/example/random", (req, res) => {
    const { min = 1, max = 100 } = req.query
    const randomNum = Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min)
    
    res.json({
      data: {
        random: randomNum,
        min: parseInt(min),
        max: parseInt(max),
        timestamp: new Date().toISOString()
      }
    })
  })
}