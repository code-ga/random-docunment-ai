# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y python3 make build-essential libvips-dev

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json drizzle.config.ts /temp/dev/
RUN cd /temp/dev && bun install --omit=dev && bun add sharp --platform=linux --arch=x64

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json drizzle.config.ts /temp/prod/
RUN cd /temp/prod && bun install --production && bun add sharp --platform=linux --arch=x64

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# just for the test step
RUN bun add drizzle-kit
RUN bun run test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/ .
RUN chmod +x ./run.sh
ENV NODE_ENV=production
# run the app
# USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["sh","./run.sh"]