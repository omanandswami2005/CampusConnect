#!/bin/bash

echo "🚀 CampusConnect Backend Deployment Script"
echo "=========================================="

# Build the application
echo "📦 Building Spring Boot application..."
./mvnw clean package -DskipTests -B

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 JAR file created: target/campusconnect-0.0.1-SNAPSHOT.jar"
    echo "🐳 Ready for Docker deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Optional: Test the JAR locally
echo ""
echo "🧪 To test locally:"
echo "java -jar target/campusconnect-0.0.1-SNAPSHOT.jar"
echo ""
echo "🌐 To deploy to Render.com:"
echo "1. Push to GitHub"
echo "2. Connect repository in Render dashboard"
echo "3. Set environment variables"
echo "4. Deploy!"