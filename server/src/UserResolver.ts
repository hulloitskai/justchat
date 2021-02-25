import "reflect-metadata";

import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  Int,
  InputType,
  Field,
  ID,
} from "type-graphql";
import { Length } from "class-validator";

import { Message } from "./Message";
import { User } from "./User";
import { Context } from "./context";
import { Room } from "./Room";

@InputType()
class CreateUserInput {
  @Field(type => String)
  @Length(3, 128)
  name: string;

  @Field(type => ID)
  roomId: string;

  @Field(type => String, { nullable: true })
  roomSecret: string | null;
}

@InputType()
class IdentifyUserInput {
  @Field(type => String)
  @Length(3, 128)
  name: string;

  @Field(type => ID)
  roomId: string;

  @Field(type => String, { nullable: true })
  roomSecret: string | null;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(type => Room)
  async room(@Ctx() ctx: Context, @Root() user: User): Promise<Room> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .room() as Promise<Room>;
  }

  @FieldResolver(type => [Message])
  async messages(@Ctx() ctx: Context, @Root() user: User): Promise<Message[]> {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .messages();
  }

  @Query(returns => User, { nullable: true })
  async user(@Ctx() ctx: Context, @Arg("id", type => ID) id: string) {
    return ctx.prisma.user.findUnique({
      where: { id: id },
    });
  }

  @Mutation(returns => User)
  async createUser(
    @Ctx() ctx: Context,
    @Arg("input") input: CreateUserInput,
  ): Promise<User> {
    const { name, roomId, roomSecret } = input;

    const room = await ctx.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new Error("Room not found.");
    }
    if (room.secret !== null && room.secret !== roomSecret) {
      throw new Error("Not authorized.");
    }

    return ctx.prisma.user.create({
      data: {
        name,
        room: {
          connect: {
            id: roomId,
          },
        },
        messages: {
          create: [],
        },
      },
    });
  }

  @Mutation(returns => User)
  async identifyUser(
    @Ctx() ctx: Context,
    @Arg("input") input: IdentifyUserInput,
  ): Promise<User> {
    const { name, roomId, roomSecret } = input;

    const room = await ctx.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new Error("Room not found.");
    }
    if (room.secret !== null && room.secret !== roomSecret) {
      throw new Error("Not authorized.");
    }

    // Find existing user by name, or create a new one.
    let user = await ctx.prisma.user.findUnique({
      where: {
        name_roomId: {
          name,
          roomId,
        },
      },
    });
    if (!user) {
      user = await ctx.prisma.user.create({
        data: {
          name,
          room: {
            connect: {
              id: roomId,
            },
          },
          messages: {
            create: [],
          },
        },
      });
    }

    return user;
  }
}
