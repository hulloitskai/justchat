import "reflect-metadata";
import { Resolver, Query, Arg, Ctx } from "type-graphql";

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
}
