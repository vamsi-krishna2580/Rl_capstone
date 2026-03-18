import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database for Fleet Management
  const fleet = {
    drivers: [
      { id: 'd1', name: 'John Doe', status: 'active', currentLoc: 'depot' },
      { id: 'd2', name: 'Jane Smith', status: 'active', currentLoc: 'depot' }
    ],
    deliveries: [
      { id: 'r1', locationId: 'l1', deadline: 500, completed: false },
      { id: 'r2', locationId: 'l2', deadline: 700, completed: false },
      { id: 'r3', locationId: 'l3', deadline: 300, completed: false }
    ],
    metrics: {
      totalDistance: 1240,
      completedDeliveries: 45,
      efficiency: 0.88
    }
  };

  // API Endpoints
  app.get("/api/fleet", (req, res) => {
    res.json(fleet);
  });

  app.post("/api/optimize-route", (req, res) => {
    // In a real app, this would call the DQN optimizer
    // For the demo, we return a simulated optimal next step
    const { currentLocationId, remainingDeliveries } = req.body;
    const nextLocId = remainingDeliveries[0] || 'depot';
    res.json({ nextLocationId: nextLocId });
  });

  app.get("/api/metrics", (req, res) => {
    res.json(fleet.metrics);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
