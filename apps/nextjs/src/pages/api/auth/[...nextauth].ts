import NextAuth from "next-auth";

import { authOptions } from "@acme/auth/src/auth-options";

//'~/server/config/auth';

export default NextAuth(authOptions);
