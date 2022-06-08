import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { connect } from './mongo-connect';
import { Session, SessionModel } from './models/SessionModel';
import {
  AuthenticateRequestBody,
  AuthenticationError,
  SessionController,
} from './controllers/SessionController';
import { bindController } from './utils';

export async function makeServer(): Promise<FastifyInstance> {
  const db = await connect();
  const sessionModel = new SessionModel(db);
  const sessionController = new SessionController(sessionModel);
  const fastify = Fastify({
    logger: false,
  });
  async function requireAuth<T>(
    handler: (data: T, u: Session) => Promise<unknown>,
    req: FastifyRequest,
  ): Promise<(data: T) => Promise<unknown>> {
    const token = req.headers.authorization ?? '';
    try {
      const user = await sessionModel.findByToken(token.replace('Bearer ', ''));
      return (data) => handler(data, user);
    } catch (e) {
      req.log.error(e);
      throw new AuthenticationError();
    }
  }

  fastify.get('/healthz', async () => {
    return { status: 'OK' };
  });

  fastify.post<{ Body: AuthenticateRequestBody }>(
    '/authenticate',
    async (request, reply) => {
      return await bindController<AuthenticateRequestBody>(
        sessionController.create,
        request,
        reply,
      );
    },
  );

  fastify.delete('/session', async (req, res) =>
    bindController(await requireAuth(sessionController.destroy, req), req, res),
  );

  return fastify;
}
