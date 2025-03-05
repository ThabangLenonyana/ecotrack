# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build:prod

# Backend build stage
FROM maven:3.8.4-openjdk-17-slim AS backend-build
WORKDIR /app
COPY pom.xml .
# Copy compiled Angular files to the static directory
COPY --from=frontend-build /app/frontend/dist/frontend/browser /app/src/main/resources/static
COPY src ./src
RUN mvn clean package -DskipTests

# Final runtime stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=backend-build /app/target/waste-management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]