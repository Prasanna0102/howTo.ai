import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";

// Export app for Netlify Functions
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup request logging middleware
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

      console.log(logLine);
    }
  });

  next();
});

// Setup API routes
registerRoutes(app).then(server => {
  // Add error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Only include error details in development mode
    const errorResponse = {
      message: isProduction ? (status === 500 ? "Internal Server Error" : message) : message,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        details: err.details || err 
      })
    };

    res.status(status).json(errorResponse);
    
    // Enhanced error logging 
    if (isProduction) {
      console.error('Server error occurred:', {
        status,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        errorType: err.name || 'Error',
        errorMessage: err.message
      });
    } else {
      console.error('Server error:', err);
    }
    
    // Recover from any uncaught JSON parsing errors in the Claude API responses
    if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
      console.error('JSON parsing error - attempting recovery');
    }
  });

  // Always use production mode in Netlify
  serveStatic(app);
}).catch(err => {
  console.error("Failed to register routes:", err);
});