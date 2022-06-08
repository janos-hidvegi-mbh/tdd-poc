import { makeServer } from './makeServer';

describe('App', () => {
  it('should return 200 on /healthz', async () => {
    const server = await makeServer();
    const response = await server.inject({
      method: 'GET',
      path: '/healthz',
    });
    expect(response.statusCode).toBe(200);
  });
});
