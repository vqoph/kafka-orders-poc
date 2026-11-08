# Multi-stage build for one Spring Boot service from the backend Maven reactor.
# Build context: backend/
# Example:
#   docker build -f docker/Dockerfile --build-arg SERVICE=order-service -t kafka-orders-order-service .
ARG JAVA_VERSION=21

FROM maven:3.9-eclipse-temurin-${JAVA_VERSION} AS build
ARG SERVICE
WORKDIR /src

COPY pom.xml ./
COPY libs ./libs
COPY services ./services

RUN test -n "${SERVICE}" \
    && mvn -B -pl "services/${SERVICE}" -am -DskipTests package \
    && JAR="$(ls "services/${SERVICE}/target/${SERVICE}-"*.jar | grep -v plain | head -n 1)" \
    && cp "${JAR}" /app.jar

FROM eclipse-temurin:${JAVA_VERSION}-jre-jammy AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app.jar /app/app.jar

ENV JAVA_TOOL_OPTIONS="-Xmx256m" \
    SPRING_PROFILES_ACTIVE=demo

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
