import "reflect-metadata";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "./User";
import { Message } from "./Message";

@ObjectType()
export class Room {
  @Field(type => ID)
  id: string;

  @Field(type => Date)
  createdAt: Date;

  @Field(type => Date)
  updatedAt: Date;

  @Field(type => String)
  name: string;

  @Field(type => String)
  handle: string;

  // @Field(type => [User])
  // members?: [User];

  // @Field(type => [Message])
  // messages?: [Message];
}
