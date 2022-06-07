import { Session, SessionModel } from '../models/SessionModel';
import { FastifyRequest } from 'fastify';

export class AuthenticationError implements Error {
  message = 'Unauthenticated';
  statusCode = 401;
  name = 'AuthenticationError';
}

export interface AuthenticateRequestBody {
  username: string;
  password: string;
}

export interface LogoutRequestBody {
  token: string;
}

export class SessionController {
  private model: SessionModel;
  constructor(model: SessionModel) {
    this.model = model;
  }

  /**
   * Authenticates users and creates sessions
   */
  public create = async ({ username, password }: AuthenticateRequestBody) => {
    if (username !== 'admin' || password !== 'admin') {
      throw new AuthenticationError();
    }
    const token = Math.random().toString(32);
    await this.model.create({ token, username });
    return { token };
  };

  public destroy = async (_: unknown, session: Session) => {
    await this.model.removeByToken(session.token);
    return { message: 'Logout success' };
  };
}
