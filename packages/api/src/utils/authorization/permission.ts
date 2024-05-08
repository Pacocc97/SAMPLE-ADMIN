import type { Session } from "next-auth";

export function hasPermission(session: Session | null, permission: string) {
  if (!session || !session.user) {
    return { status: false, message: "You are not logged in!" };
  }

  if (!session.user.permissions?.includes(permission)) {
    return {
      status: false,
      message: `Not Authorized to ${permission.replace("_", " ")}!`,
    };
  }

  return {
    status: true,
    message: `Authorized to ${permission.replace("_", " ")}`,
  };
}
