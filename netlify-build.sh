#!/bin/bash

# Run the Vite build to generate the client static files
npx vite build

# Create the functions directory
mkdir -p dist/functions

# Build the server as a Netlify function with explicit format control using netlify-server.ts
npx esbuild server/netlify-server.ts --platform=node --packages=external --bundle --format=cjs --target=node16 --outdir=dist/functions/

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

# Create a Netlify function handler with CommonJS syntax
cat > dist/functions/api.js << 'EOF'
// Netlify function wrapper for the Express app
const { app } = require('./index.js');
const serverless = require('serverless-http');

// Create a serverless handler from the Express app
const handler = serverless(app);

// Export the handler for Netlify Functions
exports.handler = async (event, context) => {
  try {
    // Return the serverless handler response
    return await handler(event, context);
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
EOF

# Ensure the file is executable
chmod +x dist/functions/api.js

echo "Build completed successfully. The application is ready for Netlify deployment."