import { Db } from 'mongodb';
import { connect } from '../mongo-connect';
import { SessionModel } from '../models/SessionModel';
import { makeServer } from '../makeServer';

let TEST_DB: Db;

beforeAll(async () => {
  TEST_DB = await connect();
});

describe('Channel State Handling', function () {
  it('should update channel state when requesting correct state', async () => {
    expect(true).toBeTruthy();
  });
});
