const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

const PORT = 3131;
const APP_ROOT = path.join(__dirname, "..");
const IS_WIN = process.platform === "win32";
const BIN_EXT = IS_WIN ? ".cmd" : "";
const BIN_DIR = path.join(APP_ROOT, "node_modules", ".bin");

let nextProcess = null;

// Espera hasta que el puerto esté disponible
function waitForPort(port, maxMs = 60000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + maxMs;
    function attempt() {
      const sock = net.createConnection({ port, host: "127.0.0.1" });
      sock.on("connect", () => { sock.destroy(); resolve(); });
      sock.on("error", () => {
        if (Date.now() > deadline) return reject(new Error("Tiempo de espera agotado"));
        setTimeout(attempt, 700);
      });
    }
    attempt();
  });
}

async function startServer(dbPath) {
  const env = {
    ...process.env,
    DATABASE_URL: `file:${dbPath}`,
    AUTH_SECRET: "onlytracker-desktop-local-secret-2026",
    NEXTAUTH_URL: `http://localhost:${PORT}`,
    NODE_ENV: "production",
    PORT: String(PORT),
  };

  // Sincroniza el schema SQLite con la base de datos local
  await new Promise((resolve, reject) => {
    const prisma = spawn(
      path.join(BIN_DIR, `prisma${BIN_EXT}`),
      ["db", "push", "--schema", path.join(APP_ROOT, "prisma", "schema.sqlite.prisma"), "--skip-generate"],
      { cwd: APP_ROOT, env, shell: true }
    );
    prisma.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`Prisma terminó con código ${code}`));
    });
    prisma.on("error", reject);
  });

  // Inicia el servidor Next.js
  nextProcess = spawn(
    path.join(BIN_DIR, `next${BIN_EXT}`),
    ["start", "--port", String(PORT)],
    { cwd: APP_ROOT, env, shell: true }
  );

  nextProcess.on("error", err => console.error("Error servidor:", err));

  await waitForPort(PORT);
}

async function createWindow() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "onlytracker.db");

  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: "OnlyTracker Morfi",
    backgroundColor: "#F9F6F1",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  win.setMenuBarVisibility(false);

  // Pantalla de carga
  win.loadURL(
    "data:text/html," +
    encodeURIComponent(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #F9F6F1; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
  .logo { font-size: 2.4rem; font-weight: 900; background: linear-gradient(135deg, #E8704A, #7C6DC7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .sub { color: #9C9485; margin-top: 10px; font-size: 0.95rem; }
  .dot { display: inline-block; animation: blink 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,80%,100% { opacity: 0.3; } 40% { opacity: 1; } }
</style></head>
<body>
  <div style="text-align:center">
    <p class="logo">OnlyTracker</p>
    <p class="sub">Iniciando<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></p>
  </div>
</body>
</html>`)
  );

  win.show();

  try {
    await startServer(dbPath);
    win.loadURL(`http://localhost:${PORT}`);
  } catch (err) {
    win.loadURL(
      "data:text/html," +
      encodeURIComponent(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { background: #F9F6F1; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui; color: #EF4444; padding: 24px; }
  p { text-align: center; font-size: 0.95rem; }
</style></head>
<body><p>Error al iniciar la app:<br><br>${String(err).replace(/</g,"&lt;")}</p></body>
</html>`)
    );
  }

  // Links externos se abren en el navegador del sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (nextProcess) nextProcess.kill();
  app.quit();
});

app.on("before-quit", () => {
  if (nextProcess) nextProcess.kill();
});
