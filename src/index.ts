import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import {
  AuthenticateRequestBody,
  AuthenticationError,
  LogoutRequestBody,
  SessionController,
} from './controllers/SessionController';
import { connect } from './mongo-connect';
import { Session, SessionModel } from './models/SessionModel';

async function bindController<T>(
  handler: (data: T) => Promise<unknown>,
  request: FastifyRequest<{ Body?: T }>,
  reply: FastifyReply,
) {
  try {
    return await handler(request.body!);
  } catch (e) {
    if (e instanceof AuthenticationError) {
      return reply.status(e.statusCode).send({ message: e.message });
    }
    request.log.error(e);
    return reply.status(500).send({ message: 'Internal server error' });
  }
}

export async function build(): Promise<FastifyInstance> {
  const db = await connect();
  const sessionModel = new SessionModel(db);
  const sessionController = new SessionController(sessionModel);
  const fastify = Fastify({
    logger: true,
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
  fastify.route({
    url: '/session',
    method: 'DELETE',
    handler: async (req, res) =>
      bindController(
        await requireAuth(sessionController.destroy, req),
        req,
        res,
      ),
  });

  return fastify;
}

export async function main() {
  const server = await build();
  const address = await server.listen(0);
  console.log(`Server listening on ${address}`);
}
