import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from 'fs';
import path from 'path';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

(async () => {
  try {
    log('Starting server initialization...');

    // Create server and register routes
    const server = await registerRoutes(app);
    log('Routes registered successfully');

    // Setup Vite or static serving
    if (process.env.NODE_ENV === "development") {
      try {
        log('Setting up Vite for development...');
        await setupVite(app, server);
        log('Vite setup complete');
      } catch (error) {
        console.error('Failed to setup Vite:', error);
        process.exit(1);
      }
    } else {
      // Create public directory if it doesn't exist
      const publicDir = path.join(process.cwd(), 'server', 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        log(`Created public directory at ${publicDir}`);
      }
      serveStatic(app);
    }

    // Start server
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`Server is running at http://0.0.0.0:${port}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();