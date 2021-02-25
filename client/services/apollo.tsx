import React, { FC, useMemo } from "react";

import { PossibleTypesMap, TypePolicies } from "@apollo/client";
import { ApolloClient as Client } from "@apollo/client";
import { useApolloClient as useClient } from "@apollo/client";

import { ApolloProvider as Provider } from "@apollo/client";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client";

const TYPE_POLICIES: TypePolicies = {};

const POSSIBLE_TYPES: PossibleTypesMap = {};

const createClient = (): Client<NormalizedCacheObject> => {
  return new Client({
    uri: "/api/graphql",
    cache: new InMemoryCache({
      typePolicies: TYPE_POLICIES,
      // TODO: Figure out how to generate this from `schema.json`.
      possibleTypes: POSSIBLE_TYPES,
    }),
  });
};

export type ApolloClient = Client<NormalizedCacheObject>;

export const useApolloClient = useClient as () => ApolloClient;

export const ApolloProvider: FC = ({ children }) => {
  const client = useMemo(() => createClient(), []);
  return <Provider client={client}>{children}</Provider>;
};

let sharedServerClient: ApolloClient | null = null;

export const getServerClient = (): ApolloClient => {
  if (!sharedServerClient) {
    const serverUrl = `${process.env.NEXT_API_URL}/graphql`;
    sharedServerClient = new Client({
      uri: serverUrl,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
        },
      },
    });
  }
  return sharedServerClient;
};
