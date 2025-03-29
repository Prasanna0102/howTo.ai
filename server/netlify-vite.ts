import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

// For Netlify's CommonJS environment - replaced import.meta with fixed paths
// Using a fixed path for Netlify Functions 
const __dirname = '/var/task'; // Standard path in Netlify Functions environment

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  try {
    // Netlify Functions have a specific directory structure
    // In production, built files are in the published directory
    const distPath = '/var/task/public';
    
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true
    }));

    // Fall through to index.html for SPA routing
    app.use("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    log("Static files configured for production");
  } catch (error) {
    console.error("Error setting up static files:", error);
  }
}