import { Session, User } from "better-auth/types";
import { Context } from "elysia";
import { auth } from "../libs/auth/auth";


export const userMiddleware = async (c: Context) => {
  const session = await auth.api.getSession({ headers: c.request.headers });

  if (!session) {
    // c.set.status = 401;
    // return { success: 'error', message: "Unauthorized Access: Token is missing" };
    return c.status(401, { status: 401, type: "error", success: false, message: "Unauthorized Access: Token is missing" });
  }

  return {
    user: session.user,
    session: session.session
  }
}

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session
  }
}