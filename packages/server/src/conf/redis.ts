import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const redishost = process.env.REDISHOST;

export function redisSetup():RedisStore {
  const redisClient = createClient()
  redisClient.connect().catch(console.error)
  return new RedisStore({client: redisClient, prefix: 'mernstack:'})
}
