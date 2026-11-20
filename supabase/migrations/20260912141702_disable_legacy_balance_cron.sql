BEGIN;

DO $block$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobid = 1
      AND jobname = 'release-due-balances'
  ) THEN
    PERFORM cron.unschedule(1);
  END IF;
END
$block$;

COMMIT;
