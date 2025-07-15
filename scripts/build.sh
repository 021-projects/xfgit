TARGETS=(
  "linux-x64"
  "linux-arm64"
  "windows-x64"
  "darwin-x64"
  "darwin-arm64"
  "linux-x64-musl"
)

for TARGET in "${TARGETS[@]}"; do
  echo "Building for $TARGET..."
  bun build ./src/index.ts --compile --minify --bytecode --outfile "./bin/xfgit-$TARGET" --target "bun-$TARGET"
done