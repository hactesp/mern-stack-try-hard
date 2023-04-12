import express, { Express } from 'express';
import { UserModel } from "./schemas/user.schema";
import session from 'express-session';
import { dbConnectEstablish, ses } from "./conf";
import helmet from "helmet";


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app: Express = express();
void dbConnectEstablish();

app.use(session(ses));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
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


app.get('/', (req, res) => {
  console.log('Inside the homepage callback function')
  console.log(req['sessionID'])
  res.send({message: 'Hello API'});
});

app.get('/login', (req, res) => {
  console.log('Inside GET /login callback function')
  console.log(req['sessionID'])
  res.send(`You got the login page!\n`)
});

app.post('/login',(req, res) => {
  console.log('Inside POST /login callback function')
  console.log(req.body)
  res.send(`You posted to the login page!\n`)
});

app.post('/user', async (req, res) => {
  const payload = new UserModel(req.body);
  await payload.save().then(value => res.send(value)).catch((err) => res.send(err));
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${ host }:${ port }`);
});
