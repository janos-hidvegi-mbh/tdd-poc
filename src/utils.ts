import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from './controllers/SessionController';

export async function bindController<T>(
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
