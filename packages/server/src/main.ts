import express, {Express} from 'express';
import {UserModel} from "./schemas/user.schema";
import {configureHelmet, configureOther, configurePassport, configureSession, dbConnectEstablish} from "./conf";
import passport from 'passport';
import bcrypt from "bcrypt";

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app: Express = express();
void dbConnectEstablish();
configureSession(app);
configureOther(app);
configurePassport(app);
configureHelmet(app);


app.get('/', (req, res) => {
  res.send({message: 'Hello API'});
});

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('You redirect to board')
  } else {
    res.send('You see login again')
  }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    req.login(user, (err) => {
      if (err || !user) {
        return res.send(err);
      }
      return res.redirect('/authrequired');
    })
  })(req, res, next);
});

app.get('/authrequired', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n')
  } else {
    res.redirect('/')
  }
})

app.post('/user', async (req, res) => {
  req.body['password'] = await bcrypt.hash(req.body['password'], 10);
  const payload = new UserModel(req.body);
  await payload.save().then(value => res.send(value)).catch((err) => res.send(err));
});

app.get('/user/:userID', async (req, res) => {
  const result = UserModel.findById(req.user['id']);
  res.send(result);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
