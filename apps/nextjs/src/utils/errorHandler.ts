import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";

export function handleTRPCError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A record with that value already exists",
      });
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}
