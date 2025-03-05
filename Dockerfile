# ---- Stage 1: Build the TypeScript application ----
FROM oven/bun:1 as build
WORKDIR /app

# Copy dependency files and install (Bun uses bun.lock for lockfile)
COPY package.json bun.lock ./
RUN bun install

# Copy source code and transpile TypeScript to JavaScript
COPY . .
RUN bun add -d typescript    #ensure TypeScript compiler is available
RUN bun run build   #(output to /app/dist)

# ---- Stage 2: Create the runtime image with Bun and the app ----
FROM oven/bun:1-alpine as runtime
WORKDIR /app

# Copy compiled app and any necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./ 
COPY --from=build /app/bun.lock ./ 
COPY --from=build /app/node_modules ./node_modules

# Install the AWS Lambda Web Adapter extension (includes the Runtime Interface Client)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter

# Set the port for the web server (8080 is the adapter's default)
ENV PORT=8080
EXPOSE $PORT  

# Command to start the Bun server when the container starts
CMD ["bun", "dist/index.js"]
