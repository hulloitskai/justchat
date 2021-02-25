import "reflect-metadata";

import {
  Resolver,
  FieldResolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Root,
  InputType,
  ID,
  Field,
  Int,
} from "type-graphql";
import { Length, Matches } from "class-validator";

import { Room } from "./Room";
import { User } from "./User";
import { Message } from "./Message";
import { Context } from "./context";

@InputType()
class CreateRoomInput {
  @Field(type => String)
  @Length(1, 128)
  name: string;

  @Field(type => String)
  @Length(3, 128)
  @Matches(/[a-z0-9][a-z0-9\-]*[a-z0-9]/)
  handle: string;

  @Field(type => String, { nullable: true })
  @Length(3, 32)
  @Matches(/[a-zA-Z0-9]/)
  secret: string | null;
}

@Resolver(Room)
export class RoomResolver {
  @FieldResolver(type => [User])
  async members(
    @Ctx() ctx: Context,
    @Root() room: Room,
  ): Promise<User[] | null> {
    return ctx.prisma.room
      .findUnique({
        where: {
          id: room.id,
        },
      })
      .members();
  }

  @FieldResolver(type => [Message])
  async messages(
    @Ctx() ctx: Context,
    @Root() room: Room,
    @Arg("take", type => Int, { defaultValue: 50 }) take: number,
    @Arg("skip", type => Int, { defaultValue: 0 }) skip: number,
  ): Promise<Message[] | null> {
    return ctx.prisma.message.findMany({
      where: { room: room },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    });
  }

  @Query(returns => Room, { nullable: true })
  async room(
    @Ctx() ctx: Context,
    @Arg("id", type => ID) id: string,
    @Arg("secret", type => String, { nullable: true }) secret: string | null,
  ) {
    const room = await ctx.prisma.room.findUnique({
      where: { id },
    });
    if (!room) return null;

    if (room.secret !== null && room.secret !== secret) {
      throw new Error("not authorized");
    }
    return room;
  }

  @Mutation(returns => Room)
  async createRoom(
    @Ctx() ctx: Context,
    @Arg("input") input: CreateRoomInput,
  ): Promise<Room> {
    const { name, handle, secret } = input;
    return ctx.prisma.room.create({
      data: {
        name,
        handle,
        secret,
        members: {
          create: [],
        },
        messages: {
          create: [],
        },
      },
    });
  }
}
