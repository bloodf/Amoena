import { initTRPC, TRPCError } from "@trpc/server";

// --- Context type ---

export interface Context {
  /** Optional authenticated user ID; undefined for unauthenticated requests. */
  userId?: string;
}

// --- tRPC initialisation ---

export const t = initTRPC.context<Context>().create();

// --- Reusable builders ---

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// --- App router ---

export const appRouter = router({});

export type AppRouter = typeof appRouter;
