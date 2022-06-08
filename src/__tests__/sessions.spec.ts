import { Db } from 'mongodb';
import { connect } from '../mongo-connect';
import { SessionModel } from '../models/SessionModel';
import { makeServer } from '../makeServer';

let TEST_DB: Db;

beforeAll(async () => {
  TEST_DB = await connect();
});

describe('Session handling', function () {
  it('should issue session tokens when using valid credentials', async () => {
    const server = await makeServer();
    const response = await server.inject({
      method: 'POST',
      payload: { username: 'admin', password: 'admin' },
      path: '/authenticate',
    });
    expect(response.statusCode).toBe(200);
    const token = response.json().token;
    expect(token).toBeTruthy();
    const sessionModel = new SessionModel(TEST_DB);
    expect(await sessionModel.findByToken(token)).toMatchObject({
      username: 'admin',
    });
  });

  it('should return 401 when authenticating with invalid credentials', async () => {
    const server = await makeServer();
    const response = await server.inject({
      method: 'POST',
      payload: { username: 'admin', password: 'wrongpass' },
      path: '/authenticate',
    });
    expect(response.statusCode).toBe(401);
  });

  it('should destroy sessions when logging out', async () => {
    const server = await makeServer();
    const token = (
      await server.inject({
        method: 'POST',
        payload: { username: 'admin', password: 'admin' },
        path: '/authenticate',
      })
    ).json().token;

    const response = await server.inject({
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
      path: '/session',
    });

    expect(response.statusCode).toBe(200);
    const sessionModel = new SessionModel(TEST_DB);
    await expect(sessionModel.findByToken(token)).rejects.toBeTruthy();
  });

  it('should respond with 401 when invalid token provided', async () => {
    const server = await makeServer();
    const token = 'invalid';

    const response = await server.inject({
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
      path: '/session',
    });

    expect(response.statusCode).toBe(401);
  });
});
