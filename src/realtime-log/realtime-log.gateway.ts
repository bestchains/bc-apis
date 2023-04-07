import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { PassThrough } from 'stream';
import { Server, WebSocket } from 'ws';
import { Request } from 'express';
import * as querystring from 'node:querystring';
import { Logger } from '@nestjs/common';
import { getAuthFromToken } from 'src/common/utils';

interface RealtimeLogOptions {
  namespace: string;
  pod: string;
  container: string;
  token: string;
}

@WebSocketGateway(8025, { path: '/bc-ws/k8s/logs' })
export class RealtimeLogGateway {
  constructor(private readonly k8sService: KubernetesService) {}

  logger = new Logger('RealtimeLogGateway');

  @WebSocketServer()
  server: Server;

  async handleConnection(client: WebSocket, request: Request) {
    const options = querystring.parse(request.url.split('?')[1]);
    const {
      namespace = 'default',
      pod,
      container,
      token,
    } = options as unknown as RealtimeLogOptions;
    if (!namespace || !pod || !token) {
      this.closeClient(client, 'namespace, pod, token in query is required.');
      return;
    }
    try {
      const auth = getAuthFromToken(token);
      const username = auth.name || 'N/A';
      const ip = request.socket.remoteAddress;
      this.logger.log(
        `${username}@${ip} logs pod => ${namespace} > ${pod} > ${container}`,
      );
      const user = {
        name: username,
        token,
        ip,
      };
      const logClient = await this.k8sService.logClient(user);
      const logStream = new PassThrough();
      logStream.on('data', (chunk) => {
        client.send(chunk.toString());
      });

      logClient
        .log(namespace, pod, container, logStream, {
          pretty: true,
          tailLines: 20,
          follow: true,
        })
        .catch((err) => {
          this.logger.error(err?.body?.message);
          this.closeClient(client, err?.body?.message);
        });
    } catch (err) {
      this.logger.error(err);
      this.closeClient(client, err.message);
    }
  }

  closeClient(client: WebSocket, message: string, code = 1000) {
    if (client.readyState === client.CLOSED) {
      return;
    }
    client.send(message?.toString());
    client.close(code);
  }
}
