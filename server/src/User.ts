import "reflect-metadata";
import { ObjectType, Field, ID } from "type-graphql";
import { IsEmail } from "class-validator";

import { Message } from "./Message";
import { Room } from "./Room";

@ObjectType()
export class User {
  @Field(type => ID)
  id: string;

  @Field(type => Date)
  createdAt: Date;

  @Field(type => Date)
  updatedAt: Date;

  @Field(type => String)
  name: string;

  // @Field(type => Room)
  // room?: Room;

  // @Field(type => [Message])
  // messages?: [Message];
}
