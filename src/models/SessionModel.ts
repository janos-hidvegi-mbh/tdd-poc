import { Collection, Db, WithId } from 'mongodb';

export interface Session {
  username: string;
  token: string;
}

export class SessionModel {
  private collection: Collection<Session>;

  constructor(db: Db) {
    this.collection = db.collection<Session>('sessions');
  }

  async findByToken(token: string): Promise<WithId<Session>> {
    const result = await this.collection.findOne({ token });
    if (!result) {
      throw new Error('Session not found');
    }
    return result;
  }

  async create(data: Session) {
    return this.collection.insertOne(data);
  }

  async removeByToken(token: string) {
    return this.collection.deleteOne({ token });
  }
}
