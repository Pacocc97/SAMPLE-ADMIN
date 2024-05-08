import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";

type CustomPrismaError = {
  code: string;
  meta: {
    target: string;
  };
  message: string;
  clientVersion: string;
};

export function handleTRPCError(error: unknown) {
  function isError(obj: unknown): obj is CustomPrismaError {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "code" in obj &&
      "meta" in obj &&
      "message" in obj &&
      "clientVersion" in obj
    );
  }
  if (isError(error)) {
    if (error.code === "P2002") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un registro con ese valor",
      });
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Ocurrió un error inesperado",
  });
}
