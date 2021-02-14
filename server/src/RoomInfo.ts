import "reflect-metadata";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "./User";
import { Message } from "./Message";

@ObjectType()
export class RoomInfo {
  @Field(type => ID)
  roomId: string;

  @Field(type => String)
  name: string;

  @Field(type => String)
  handle: string;

  @Field(type => Boolean)
  hasSecret: boolean;
}
