import "reflect-metadata";
import { buildSchema } from "type-graphql";

import { ApolloServer } from "apollo-server";
import { createContext } from "./context";

import { MessageResolver } from "./MessageResolver";
import { UserResolver } from "./UserResolver";
import { RoomResolver } from "./RoomResolver";
import { RoomInfoResolver } from "./RoomInfoResolver";

const app = async () => {
  const context = createContext();
  const schema = await buildSchema({
    resolvers: [MessageResolver, UserResolver, RoomResolver, RoomInfoResolver],
  });
  const server = new ApolloServer({ schema, context });

  server.listen({ port: 8080 }, () =>
    console.log(
      `🚀 Server ready at: http://localhost:8080\n⭐️  See sample queries: http://pris.ly/e/ts/graphql-typegraphql#using-the-graphql-api`,
    ),
  );
};

app();
