# ──────────────────────────────────────────────────────────────────────────────
# 1) Build stage: compile & package your Spring Boot JAR with system Maven
# ──────────────────────────────────────────────────────────────────────────────
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# 1. Copy only pom.xml (and any parent poms) for dependency caching
COPY pom.xml ./

# 2. Pre-fetch all dependencies
RUN mvn dependency:go-offline -B

# 3. Copy the rest of the source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ──────────────────────────────────────────────────────────────────────────────
# 2) Runtime stage: run on a slim JRE 21 image
# ──────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# 4. Bring in the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# 5. Copy your Firebase credentials into the image (so GOOGLE_APPLICATION_CREDENTIALS works)
COPY src/main/resources/firebase-sa-key.json /app/credentials/firebase-admin.json

# 6. Expose and launch
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
