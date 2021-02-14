import "reflect-metadata";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "./User";
import { Room } from "./Room";

@ObjectType()
export class Message {
  @Field(type => ID)
  id: string;

  @Field(type => Date)
  createdAt: Date;

  @Field(type => Date)
  updatedAt: Date;

  @Field(type => String)
  content: string;

  // @Field(type => User)
  // sender?: User;

  // @Field(type => Room)
  // room?: User;
}
