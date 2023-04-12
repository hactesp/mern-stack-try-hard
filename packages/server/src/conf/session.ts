import { v4 as uuid } from 'uuid';
import { redisSetup } from "./redis";

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
