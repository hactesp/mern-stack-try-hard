import { v4 as uuid } from 'uuid';
import { redisSetup } from "./redis";
import session from 'express-session';
import { Express } from 'express';

export const ses = {
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return uuid();
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: redisSetup()
};

export function configureSession(app: Express) {
  app.use(session(ses));
}