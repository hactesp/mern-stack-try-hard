import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  _uid: String
} );

export const UserModel = mongoose.model('UserModel', userSchema, 'users');
