import { makeServer } from './makeServer';

export async function main() {
  const server = await makeServer();
  const address = await server.listen(0);
  console.log(`Server listening on ${address}`);
}
