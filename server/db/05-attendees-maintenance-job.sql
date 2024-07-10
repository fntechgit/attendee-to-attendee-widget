select cron.schedule (
    'attendees-cleanup',
    '00 1 * * 6', -- Saturday at 1:00am (GMT)
     $$delete from public.access_tracking where inserted_at < now() - interval '1 month';delete from public.attendees_news where updated_at < now() - interval '1 month';$$
);

--unschedule the cron job
--select cron.unschedule('attendees-cleanup');

--query executions
--select * from cron.job_run_details order by start_time desc limit 10;