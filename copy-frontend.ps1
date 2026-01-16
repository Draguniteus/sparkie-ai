# Copy frontend build output to root for deployment
Copy-Item -Path "frontend/.next" -Destination ".next" -Recurse -Force
Copy-Item -Path "frontend/public" -Destination "public" -Recurse -Force
Copy-Item -Path "frontend/package.json" -Destination "package.json" -Force