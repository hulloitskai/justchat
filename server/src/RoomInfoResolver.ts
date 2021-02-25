import "reflect-metadata";
import { Resolver, Query, Arg, Ctx, Int } from "type-graphql";

import { RoomInfo } from "./RoomInfo";
import { Context } from "./context";

@Resolver(RoomInfo)
export class RoomInfoResolver {
  @Query(returns => RoomInfo, { nullable: true })
  async roomInfo(
    @Ctx() ctx: Context,
    @Arg("handle", type => String) handle: string,
  ) {
    const room = await ctx.prisma.room.findUnique({
      where: { handle },
    });
    if (!room) return null;

    return {
      roomId: room.id,
      hasSecret: room.secret !== null,
      ...room,
    };
  }

  @Query(returns => [RoomInfo])
  async roomInfos(
    @Ctx() ctx: Context,
    @Arg("take", type => Int, { defaultValue: 50 }) take: number,
    @Arg("skip", type => Int, { defaultValue: 0 }) skip: number,
  ) {
    const rooms = await ctx.prisma.room.findMany({
      take,
      skip,
    });
    return rooms.map(({ id, secret, ...fields }) => ({
      ...fields,
      roomId: id,
      hasSecret: secret !== null,
    }));
  }
}
