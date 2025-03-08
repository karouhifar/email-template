# ---- Stage 1: Build the TypeScript application ----
# ---- Use the Bun image as the base image ----

# -------------- STAGE 1: Install the Bun application --------------
FROM oven/bun:1 as install
WORKDIR /app

# Copy dependency files and install (Bun uses bun.lock for lockfile)
# install with --production (exclude devDependencies)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# -------------- STAGE 2: Create the runtime image with Bun and the app --------------
# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM install AS build
COPY --from=install /app/node_modules node_modules
COPY . .
ENV NODE_ENV=production
# (output to /app/dist)
RUN bun run build

# -------------- STAGE 3: Create the runtime image with Bun and the app --------------
FROM oven/bun:1-alpine as runtime
WORKDIR /app
# Copy compiled app and any necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./ 
COPY --from=install /app/node_modules ./node_modules
# Install the AWS Lambda Web Adapter extension (includes the Runtime Interface Client)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter

# Set the port for the web server (8080 is the adapter's default)
ENV PORT=3000
EXPOSE $PORT  

# Command to start the Bun server when the container starts
CMD ["bun", "dist/index.js"]
