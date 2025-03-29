#!/bin/bash

# Run the Vite build to generate the client static files
npx vite build

# Create the functions directory
mkdir -p dist/functions

# Build the server as a Netlify function
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/functions --main-fields=main,module

# Ensure public directory exists
mkdir -p dist/public

# Move assets from dist/public/assets to dist/public/assets (if needed)
if [ -d "dist/assets" ]; then
  mkdir -p dist/public/assets
  cp -r dist/assets/* dist/public/assets/
fi

# Make sure index.html is in the right place
if [ -f "dist/index.html" ]; then
  cp dist/index.html dist/public/
fi

# Create a Netlify function handler
cat > dist/functions/api.js << 'EOF'
// Netlify function wrapper for the Express app
import { app } from './index.js';
import serverless from 'serverless-http';

// Create a serverless handler from the Express app
const handler = serverless(app);

// Export the handler for Netlify Functions
export const handler = async (event, context) => {
  // Return the serverless handler response
  return await handler(event, context);
};
EOF

# Ensure the file is executable
chmod +x dist/functions/api.js

echo "Build completed successfully. The application is ready for Netlify deployment."