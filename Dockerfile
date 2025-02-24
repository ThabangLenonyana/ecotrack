FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/waste-management-0.0.1-SNAPSHOT.jar waste-management.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "waste-management.jar"]