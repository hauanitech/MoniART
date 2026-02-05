import cors from 'cors';
import express from 'express';
import { config } from '../../config.js';

export function httpMiddleware() {
  return [
    cors({ origin: config.corsOrigin }),
    express.json({ limit: config.maxPayloadSize }),
  ];
}
