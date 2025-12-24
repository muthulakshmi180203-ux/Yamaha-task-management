# Use Maven + JDK 17 Alpine image
FROM maven:3.9.1-eclipse-temurin-17-alpine AS build

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Build the Spring Boot app and skip tests
RUN mvn clean package -DskipTests

# Second stage: use minimal JDK runtime
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the built jar from the first stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render provides $PORT env variable)
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
