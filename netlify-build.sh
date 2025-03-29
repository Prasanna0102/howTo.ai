#!/bin/bash

# Run the Vite build to generate the client static files with Netlify config
# Use our special vite config without top-level await
npx vite build --config netlify-vite.config.ts

# Create the functions directory
mkdir -p dist/functions

# Build the server as a Netlify function with explicit format control using netlify-server.ts
# Output as index.js so the api.js can find it
npx esbuild server/netlify-server.ts --platform=node --packages=external --bundle --format=cjs --target=node16 --outfile=dist/functions/index.js

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
// Ensure the serverless-http package is installed
try {
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
} catch (error) {
  console.error('Error loading dependencies:', error);
  exports.handler = async () => {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server configuration error' })
    };
  };
}
EOF

# Create a package.json for the functions to ensure dependencies
cat > dist/functions/package.json << 'EOF'
{
  "name": "netlify-functions",
  "version": "1.0.0", 
  "type": "commonjs",
  "dependencies": {
    "express": "^4.18.2",
    "serverless-http": "^3.2.0",
    "@anthropic-ai/sdk": "^0.17.1"
  }
}
EOF

# Copy node_modules for the function
echo "Installing dependencies for the Netlify function..."
cd dist/functions
npm install --production
cd ../..

# Ensure the file is executable
chmod +x dist/functions/api.js

echo "Build completed successfully. The application is ready for Netlify deployment."