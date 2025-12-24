# ----------------------
# Stage 1: Build
# ----------------------
FROM maven:3.9.3-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy only pom.xml first to leverage Docker cache
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# ----------------------
# Stage 2: Run
# ----------------------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Environment variables
ENV PORT=8080
ENV DATABASE_URL=/app/data/task_management.db

# Ensure SQLite data directory exists
RUN mkdir -p /app/data

# Copy init script
COPY init.sh ./init.sh
RUN chmod +x ./init.sh

# Expose port (optional, good for documentation)
EXPOSE 8080

# Run the init script which starts the app
ENTRYPOINT ["./init.sh"]
