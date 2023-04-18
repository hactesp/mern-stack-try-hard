import passport from 'passport';
import {Strategy} from 'passport-local';
import { Express } from 'express';
import {UserModel} from "../schemas/user.schema";

export function configurePassport(app: Express) {
  //configure passport.js to use the local strategy
  passport.use(new Strategy(
          { usernameField:'userName' },
          async (email, password, done) => {
            console.log('Inside local strategy callback')
            const user = await UserModel.findOne({userName: email}).exec().catch(error => done(error));
            console.log('User fetched: ',email, user);
            if (!user) {
              return done(null, false, { message: 'Invalid credentials.\n' });
            }
            if (password != user.password) {
              return done(null, false, { message: 'Invalid credentials.\n' });
            }
            return done(null, user);
          }
          ));

  //tell passport how to serialize the user
  passport.serializeUser((user, done) => {
    done(null, user['_id']);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findOne({_id: id}).exec();
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

