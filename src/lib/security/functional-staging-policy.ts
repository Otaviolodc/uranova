type Environment = Readonly<Record<string, string | undefined>>;

/**
 * Reserved mode, intentionally not activatable yet.
 * A route allowlist cannot constrain direct browser Data API calls, database
 * triggers or scheduled jobs. Approval and dedicated database evidence must
 * precede an implementation that opens these surfaces.
 * No environment-only approval switch is accepted.
 */
export function assertFunctionalStagingPreparation(env: Environment): void {
  const mode = env.FUNCTIONAL_STAGING_MODE;
  if (env.NEXT_PUBLIC_FUNCTIONAL_STAGING_MODE) {
    throw new Error("FUNCTIONAL_STAGING_PUBLIC_FLAG_FORBIDDEN");
  }
  if (mode !== undefined && mode !== "" && mode !== "false") {
    throw new Error("FUNCTIONAL_STAGING_NOT_APPROVED");
  }
}
