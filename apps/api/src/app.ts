import cors from 'cors';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import areaRouter from "./routes/area.ts";
import propertiesRouter from './routes/properties.ts';
import express, { type ErrorRequestHandler } from 'express';

const webDist = resolve(process.env.WEB_DIST ?? resolve(import.meta.dirname, '../../web/dist'));
const webIndex = resolve(webDist, 'index.html');

export const app = express();

// Request logging: logs once the response is sent
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

//Check if is app is online
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

//Properties routes
app.use('/api/properties', propertiesRouter);

//Area routes
app.use('/api/areas', areaRouter);


app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serve the built web app; unknown GET routes fall back to index.html for client-side routing
if (existsSync(webIndex)) {
  app.use(express.static(webDist));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(webIndex);
  });
} else {
  console.warn(`Web build not found at ${webDist} — run "npm run build -w client" in xe_project or "npm run build" in apps/web`);
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.expose ? err.message : 'Internal server error' });
};

app.use(errorHandler);
