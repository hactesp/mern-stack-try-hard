import { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.ATLAS_URI;

export async function dbConnectEstablish() {
  await connect(uri, {
    dbName:'hactesp'
  }).catch(console.error)
}
