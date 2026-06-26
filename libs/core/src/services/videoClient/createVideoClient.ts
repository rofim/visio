// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IVideoRouter } from '../../../../api/src/types/IVideoRouter';
import { createTRPCClient, httpBatchLink, splitLink, TRPCLink } from '@trpc/client';
import type { Prettify, AnyFunction } from '@common/types';
import { observable } from '@trpc/server/observable';

/**
 * Creates a video client for interacting with the video API.
 *
 * @example
 * ```ts
 * const videoClient = createVideoClient({
 *   url: 'http://localhost:4000/trpc',
 * });
 *
 * videoClient.createSession(); // creates a new session
 * videoClient.createSession({ sessionId: 'existing-session-id' }); // uses an existing session
 * ```
 */
function createVideoClient(linkOptions: LinkOptions): VideoClient;

/**
 * Creates a video client for interacting with the video API.
 *
 * @example
 * ```ts
 * const videoClient = createVideoClient({
 *   links: [
 *     httpBatchLink<IVideoRouter>({
 *       url: 'http://localhost:4000/trpc',
 *     }),
 *   ],
 * });
 *
 * videoClient.createSession(); // creates a new session
 * videoClient.createSession({ sessionId: 'existing-session-id' }); // uses an existing session
 * ```
 */
// @ts-expect-error
function createVideoClient(links: Links): VideoClient;

export const mockLink: TRPCLink<IVideoRouter> = () => {
  return ({ next, op }) => {
    // Clé = "routerName.procedureName"

    console.log('op', op);
    if (op.path === 'createSession') {
      return observable((observer) => {
        observer.next({
          result: {
            data: {
              roomName: '6a3cde73ca70465b66a42096-teleconsultation',
            },
          },
        });
        observer.complete();
      });
    }

    if (op.path === 'joinSession') {
      return observable((observer) => {
        observer.next({
          result: {
            data: {
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0NzcwMjgzMSIsImlzdCI6InByb2plY3QiLCJpYXQiOjE3ODIzODE5MDIsImV4cCI6MTc4MjQ2ODMwMywic2Vzc2lvbl9pZCI6IjJfTVg0ME56Y3dNamd6TVg1LU1UYzRNak0zTkRBeE1ERTROMzVIV2tnNFZFTkxOV3RvVUc5MlRtMHlTVE5JWWxKcVFpdC1mbjQiLCJjcmVhdGVfdGltZSI6MTc4MjM4MTkwMywibm9uY2UiOjAuMDA5NDI4Njc0MDM3Njk1MjA2LCJyb2xlIjoibW9kZXJhdG9yIiwiZXhwaXJlX3RpbWUiOjE3ODI0NjgzMDMsImNvbm5lY3Rpb25fZGF0YSI6IkFkbWluIFRFQ0giLCJpbml0aWFsX2xheW91dF9jbGFzc19saXN0IjoiIiwic2NvcGUiOiJzZXNzaW9uLmNvbm5lY3QifQ.G7PNy179kf7bE7vrVxL-3dhh5qg4rMEFGRe-_jxdDeM',
              sessionId:
                '2_MX40NzcwMjgzMX5-MTc4MjM3NDAxMDE4N35HWkg4VENLNWtoUG92Tm0ySTNIYlJqQit-fn4',
              authorizationHeader:
                'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJickVmcFhlZzBDNGxyQUtIU1NqVVhneGo5ZEtmbGlxWU9iaHh3eHBkQmlvIn0.eyJleHAiOjE3ODIzODI0MTcsImlhdCI6MTc4MjM4MTgxNywiYXV0aF90aW1lIjoxNzgyMjI2OTkyLCJqdGkiOiJvbnJ0YWM6OTg5YzQwMjAtZGFlZC0zNzAxLWVlNjItNTQ0Mjc5MzM5ZjExIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgyL3JlYWxtcy9yb2ZpbSIsImF1ZCI6WyJicm9rZXIiLCJhY2NvdW50Il0sInN1YiI6IjM0ZjExMTY5LThjZGQtNDVmYi05MDgxLTIyMDhjZTExMTY4YyIsInR5cCI6IkJlYXJlciIsImF6cCI6InJvZmltIiwic2lkIjoidEkxbnBIakVTZ3RKdU5hWVhKNktaMGFRIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXJvZmltIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImJyb2tlciI6eyJyb2xlcyI6WyJyZWFkLXRva2VuIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBsb2dpbl9pZGVudGl0eV9wcm92aWRlciBlbWFpbCBwcm9maWxlIGJyb2tlci1yZWFkLXRva2VuIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBRE1JTiBURUNIIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW5Acm9maW0uZG9jdG9yIiwiZ2l2ZW5fbmFtZSI6IkFETUlOIiwiZmFtaWx5X25hbWUiOiJURUNIIiwicGljdHVyZSI6InVzZXJzL2FjY291bnRQaWN0dXJlcy81YmIxZDkxN2NhMDY2NTA3MWY0MjcyM2QvNjliYWNmMzJlODM0MDYwOGM0OTYzYmE3LnBuZyIsImVtYWlsIjoiYWRtaW5Acm9maW0uZG9jdG9yIn0.fZV1coZOSfMw3n37jrYo_pxQwJ1QteLs7XXH7srv3JVdy0DVkRx8SD2s5sbvpuxB6uYDiMmRJ8CnUxRpJL_SkrMQPge0x-X5q-BavFXUnEzH9iL5lxrKLcpEG-4vlBN92wfkljjiMgMXSTtaU44et6MH9VvvkYxxdv1VAyl1qOMqSNpduzeQ5aH23cftvbGEKAgRCyy5MxqzrZYfpabtf0bByRG7tHptIhzPRWmkkhoQgn9AnJjTp52hDsrkZOwGT84VMpm3wWaJNTymCx2-ncPK_zLcqrz-YCON4SVX9YAMqOJPiLEUftVg-l0RTXrdKe0SKuKTy8pu3Jb_3JRnog',
              room: '6a3cde73ca70465b66a42096-teleconsultation',
              type: 'teleconsultation',
              username: 'Admin TECH',
              fullname: 'Admin TECH',
              apiUrl: 'http://localhost:3000',
              apiKey: '47702831',
              iat: 1782381902,
            },
          },
        });
        observer.complete();
      });
    }

    return next(op);
  };
};

function createVideoClient(args: Links | LinkOptions): VideoClient {
  const options: Options = (() => {
    if (Array.isArray(args)) {
      return { links: args };
    }

    return {
      links: [
        splitLink({
          // Si le path est dans la liste → mockLink (pas d'appel réseau)
          condition: (op) => ['createSession', 'joinSession'].includes(op.path),
          true: mockLink,
          false: httpBatchLink<IVideoRouter>(args),
        }),
      ],
    };
  })();

  const trpcClient = createTRPCClient<IVideoRouter>(options);

  // make the proxy flatter for a better developer experience, so instead of videoClient.createSession.mutate() it's just videoClient.createSession()
  const proxy = new Proxy(trpcClient, {
    get(target, property: string) {
      const procedure = target[property as keyof typeof target];

      if (!procedure) {
        throw new Error(`Procedure ${property} does not exist on the video client`);
      }

      return (procedure as MutateProcedure).mutate;
    },
  }) as unknown as VideoClient;

  return proxy;
}

type VideoClientBase = ReturnType<typeof createTRPCClient<IVideoRouter>>;

type MutateProcedure = {
  mutate: AnyFunction;
};

type Normalize<T> = {
  [K in keyof T]: T[K] extends MutateProcedure ? T[K]['mutate'] : T[K];
};

type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends AnyFunction ? K : never]: T[K];
};

type SanitizedVideoClient = OnlyFunctions<Normalize<VideoClientBase>>;

/**
 * Video client to communicate with a vonage video handler.
 */
export type VideoClient = Prettify<SanitizedVideoClient>;

type Options = Prettify<Parameters<typeof createTRPCClient<IVideoRouter>>[0]>;

type Links = Options['links'];

type LinkOptions = Parameters<typeof httpBatchLink<IVideoRouter>>[0];

export default createVideoClient;
