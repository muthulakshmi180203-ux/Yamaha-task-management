
FROM maven:3.9.1-eclipse-temurin-17-alpine AS build

WORKDIR /app


COPY . .

# Build Spring Boot JAR
RUN mvn clean install


# =========================
# PACKAGE / RUN STAGE
# =========================
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/task-management-1.0.0.jar app.jar

# Expose port (Render uses PORT env)
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
 