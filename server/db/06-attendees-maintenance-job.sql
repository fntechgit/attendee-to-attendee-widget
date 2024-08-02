--schedule the cron job
select cron.schedule (
    'attendees-cleanup',
    '00 1 * * *', -- Every day at 1:00am (GMT)
     $$delete from public.attendees_news where (is_online = FALSE and updated_at < now() - interval '1 day') or updated_at < now() - interval '1 week';$$
);

--unschedule the cron job
--select cron.unschedule('attendees-cleanup');

--list scheduled jobs
--select * from cron.job;

--query executions
--select * from cron.job_run_details order by start_time desc limit 10;