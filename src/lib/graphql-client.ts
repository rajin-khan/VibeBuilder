import { clients } from './https';
import { getBlocksApiBaseUrl } from './blocks-api-base';

/**
 * GraphQL Client Module
 *
 * A GraphQL client utility that provides standardized methods for making GraphQL requests
 * using the existing HTTP client infrastructure. It handles authentication, error handling,
 * and follows the same patterns as the REST API client.
 *
 * Features:
 * - Typed request/response handling with generics
 * - Standardized methods for queries and mutations
 * - Automatic handling of authentication token expiration
 * - Consistent error handling with custom HttpError class
 * - Environment-based configuration
 *
 * @example
 * // Query request
 * const data = await graphqlClient.query<InventoryResponse>({
 *   query: GET_INVENTORY_QUERY,
 *   variables: { page: 1, pageSize: 10 }
 * });
 *
 * // Mutation request
 * const result = await graphqlClient.mutate<CreateInventoryResponse>({
 *   mutation: CREATE_INVENTORY_MUTATION,
 *   variables: { input: itemData }
 * });
 */

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

interface GraphQLClient {
  query<T>(request: GraphQLRequest): Promise<T>;
  /**
   * Read-only gateway query for published sites: uses postWithoutSessionRefresh and optional Bearer.
   * Omit bearer when Data Gateway **View** is Public for the queried schemas (x-blocks-key only).
   */
  queryWithVisitorBearer<T>(request: GraphQLRequest, bearerToken: string | undefined): Promise<T>;
  mutate<T>(request: GraphQLRequest): Promise<T>;
}

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';
const baseUrl = getBlocksApiBaseUrl();

const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

const PROJECT_SLUG = import.meta.env.VITE_PROJECT_SLUG || '';

const projectSlug = PROJECT_SLUG ? `/${PROJECT_SLUG}` : '';
const GRAPHQL_BASE_URL = `${cleanBaseUrl}/uds/v1${projectSlug}/gateway`; //not finding

function assertGraphQLData<T>(response: GraphQLResponse<T>): asserts response is GraphQLResponse<T> & {
  data: T;
} {
  if (response.errors && response.errors.length > 0) {
    const parts = response.errors.map((e) => {
      const ext =
        e.extensions && Object.keys(e.extensions).length > 0 ? ` ${JSON.stringify(e.extensions)}` : '';
      return `${e.message}${ext}`;
    });
    throw new Error(parts.join('; '));
  }

  if (response.data == null) {
    throw new Error('GraphQL returned no data payload');
  }
}

export const graphqlClient: GraphQLClient = {
  async query<T>(request: GraphQLRequest): Promise<T> {
    const payload = {
      query: request.query,
      variables: request.variables || {},
    };

    const response = await clients.post<GraphQLResponse<T>>(
      GRAPHQL_BASE_URL,
      JSON.stringify(payload),
      {
        'Content-Type': 'application/json',
        'x-blocks-key': projectKey,
      }
    );

    assertGraphQLData(response);
    return (response.data as T) ?? ({} as T);
  },

  async queryWithVisitorBearer<T>(
    request: GraphQLRequest,
    bearerToken: string | undefined
  ): Promise<T> {
    const payload = {
      query: request.query,
      variables: request.variables || {},
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-blocks-key': projectKey,
    };
    if (bearerToken) {
      headers['Authorization'] = `bearer ${bearerToken}`;
    }

    const response = await clients.postWithoutSessionRefresh<GraphQLResponse<T>>(
      GRAPHQL_BASE_URL,
      JSON.stringify(payload),
      headers
    );

    assertGraphQLData(response);
    return (response.data as T) ?? ({} as T);
  },

  async mutate<T>(request: GraphQLRequest): Promise<T> {
    const payload = {
      query: request.query,
      variables: request.variables || {},
    };

    const response = await clients.post<GraphQLResponse<T>>(
      GRAPHQL_BASE_URL,
      JSON.stringify(payload),
      {
        'Content-Type': 'application/json',
        'x-blocks-key': projectKey,
      }
    );

    assertGraphQLData(response);
    return response.data as T;
  },
};

export default graphqlClient;
