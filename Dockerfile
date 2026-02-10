FROM  mcr.microsoft.com/playwright:v1.55.0-jammy

WORKDIR /app

COPY . /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    npm run setup

# Set the JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64

CMD ["npm", "test"]