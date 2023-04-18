import { Express } from 'express';
import helmet from "helmet";

export function configureHelmet(app: Express) {
  app.use(helmet());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(
          helmet.contentSecurityPolicy({
            directives: {
              defaultSrc: ["'self'"],
              frameAncestors: ["'none'"],
            },
          })
          );
}