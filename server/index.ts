import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
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
  const method = req.method;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    let level = "info";
    if (status >= 500) {
      level = "error";
    } else if (status >= 400) {
      level = "warn";
    }

    const message = `${method} ${path} ${status} ${duration}ms`;
    if (level === "error") {
      console.error(message);
    } else if (level === "warn") {
      console.warn(message);
    } else {
      console.log(message);
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

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV !== "production") {
      try {
        log('Setting up Vite for development...');
        await setupVite(app, server);
        log('Vite setup complete');
      } catch (error) {
        console.error('Failed to setup Vite:', error);
        // Fallback to serving static files from client directory
        log('Falling back to static file serving...');
        const clientDir = path.join(process.cwd(), 'client');
        if (fs.existsSync(clientDir)) {
          app.get('*', (req, res, next) => {
            if (!req.path.startsWith('/api/')) {
              res.sendFile(path.join(clientDir, 'index.html'));
            } else {
              next();
            }
          });
          log('Static file serving fallback configured');
        } else {
          console.error('Client directory not found');
        }
      }
    } else {
      // Ensure client build directory exists
      const clientDir = path.join(process.cwd(), 'client', 'dist');
      if (!fs.existsSync(clientDir)) {
        console.error('Client build directory not found. Please run npm run build first.');
        process.exit(1);
      }

      // Serve static files from the client build directory
      app.use(express.static(clientDir));

      // Handle client-side routing - send index.html for all non-API routes
      app.get('*', (req, res, next) => {
        if (!req.path.startsWith('/api/')) {
          res.sendFile(path.join(clientDir, 'index.html'));
        } else {
          next();
        }
      });
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