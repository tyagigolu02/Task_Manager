const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "..");
const frontendDist = path.join(rootDir, "frontend", "dist");
const backendPublic = path.join(__dirname, "..", "public");

async function copyDir(src, dest) {
  await fs.promises.rm(dest, { recursive: true, force: true });
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  if (!fs.existsSync(frontendDist)) {
    console.error("Frontend build not found. Run the frontend build first.");
    process.exit(1);
  }

  await copyDir(frontendDist, backendPublic);
  console.log("Frontend build copied to backend/public");
})();
