-- Atomically updates a task and all cascaded downstream tasks in one transaction.
-- If any update fails the entire operation rolls back, including the primary task.
--
-- Parameters:
--   p_task_id       UUID of the task being directly edited
--   p_task_update   JSON object with the fields to update on the primary task
--                   e.g. { "start_date": "2026-05-01", "end_date": "2026-05-03", "duration_days": 3 }
--   p_cascade       JSON array of downstream task updates
--                   e.g. [{ "id": "...", "start_date": "...", "end_date": "...", "duration_days": 3 }]
--
-- Returns a JSON object: { "task": {...}, "cascaded": [{...}, ...] }

create or replace function update_task_with_cascade(
  p_task_id     uuid,
  p_task_update jsonb,
  p_cascade     jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_task        tasks%rowtype;
  v_cascaded    jsonb := '[]'::jsonb;
  v_item        jsonb;
  v_updated_row tasks%rowtype;
begin
  -- Update the primary task with only the fields present in p_task_update
  update tasks
  set
    name          = coalesce((p_task_update->>'name')::text,            name),
    start_date    = coalesce((p_task_update->>'start_date')::date,      start_date),
    end_date      = coalesce((p_task_update->>'end_date')::date,        end_date),
    duration_days = coalesce((p_task_update->>'duration_days')::integer, duration_days),
    status        = coalesce((p_task_update->>'status')::text,          status),
    updated_at    = now()
  where id = p_task_id
  returning * into v_task;

  if not found then
    raise exception 'Task % not found', p_task_id;
  end if;

  -- Apply each cascaded task update
  for v_item in select * from jsonb_array_elements(p_cascade)
  loop
    update tasks
    set
      start_date    = (v_item->>'start_date')::date,
      end_date      = (v_item->>'end_date')::date,
      duration_days = (v_item->>'duration_days')::integer,
      updated_at    = now()
    where id = (v_item->>'id')::uuid
    returning * into v_updated_row;

    if not found then
      raise exception 'Cascaded task % not found', v_item->>'id';
    end if;

    v_cascaded := v_cascaded || to_jsonb(v_updated_row);
  end loop;

  return jsonb_build_object(
    'task',     to_jsonb(v_task),
    'cascaded', v_cascaded
  );
end;
$$;
