import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";

import { api } from "~/utils/api";

export const get: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (session?.user?.email) {
    const user = await api.users.show.query({ email: session.user.email });

    return {
      body: JSON.stringify({
        // user: user?.name,
        // email: user?.email,
        // contactMails: user?.contactMails,
        // contactPhones: user?.contactPhones,
        // role: user?.role,
        ...user,
      }),
    };
  } else {
    return {
      body: JSON.stringify({
        user: "",
        email: "",
        contactMails: "",
        contactPhones: "",
        role: "",
      }),
    };
  }
};
