import "reflect-metadata";

import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  InputType,
  ID,
  Field,
} from "type-graphql";
import { MaxLength } from "class-validator";

import { Message } from "./Message";
import { User } from "./User";
import { Room } from "./Room";
import { Context } from "./context";

@InputType()
class SendMessageInput {
  @Field(type => String)
  @MaxLength(2048)
  content: string;

  @Field(type => ID)
  senderId: string;

  @Field(type => ID)
  roomId: string;

  @Field(type => String, { nullable: true })
  roomSecret: string | null;
}

@Resolver(Message)
export class MessageResolver {
  @FieldResolver(type => User)
  async sender(@Ctx() ctx: Context, @Root() message: Message): Promise<User> {
    return ctx.prisma.message
      .findUnique({
        where: {
          id: message.id,
        },
        rejectOnNotFound: true,
      })
      .sender() as Promise<User>;
  }

  @FieldResolver(type => Room)
  async room(
    @Ctx() ctx: Context,
    @Root() message: Message,
  ): Promise<Room | null> {
    return ctx.prisma.message
      .findUnique({
        where: {
          id: message.id,
        },
        rejectOnNotFound: true,
      })
      .room() as Promise<Room>;
  }

  @Query(returns => Message, { nullable: true })
  async message(@Ctx() ctx: Context, @Arg("id", type => ID) id: string) {
    return ctx.prisma.message.findUnique({
      where: { id },
    });
  }

  @Mutation(returns => Message)
  async sendMessage(
    @Ctx() ctx: Context,
    @Arg("input") input: SendMessageInput,
  ): Promise<Message> {
    const { content, senderId, roomId, roomSecret } = input;

    const room = await ctx.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new Error("room not found");
    }
    if (room.secret !== roomSecret) {
      throw new Error("not authorized");
    }

    return ctx.prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: senderId },
        },
        room: {
          connect: { id: roomId },
        },
      },
    });
  }
}
