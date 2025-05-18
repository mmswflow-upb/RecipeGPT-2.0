#############################################################################
# 1) Build stage: compile & package on JDK 21
#############################################################################
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven wrapper+POM first for layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Make wrapper executable and prefetch deps
RUN chmod +x mvnw \
    && ./mvnw dependency:go-offline -B

# Copy all source & build the fat JAR (skip tests)
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

#############################################################################
# 2) Runtime stage: run on a slim JRE 21 image
#############################################################################
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Bring in the packaged JAR
COPY --from=build /app/target/*.jar app.jar

# Expose the same port your Spring Boot app uses
ENV PORT=8081
EXPOSE 8081

# Launch the JAR
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
