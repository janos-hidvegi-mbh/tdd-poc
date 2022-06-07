import { MongoClient } from 'mongodb';

export async function connect() {
  const uri = 'mongodb://devroot:devroot@127.0.0.1:27017/admin';
  const client = await MongoClient.connect(uri);
  return client.db('testing');
}
