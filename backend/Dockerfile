# Use OpenJDK 21 (full JDK slim variant)
FROM openjdk:21-jdk-slim

# Create work directory
WORKDIR /app

# Copy Maven wrapper & POM for layer caching
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download all dependencies (offline) — speeds up subsequent builds
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application, skipping tests for speed (optionally enable later)
RUN ./mvnw clean package -DskipTests -B

# Expose port (Render will route to this)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/campusconnect-0.0.1-SNAPSHOT.jar"]
