CREATE TABLE
  public.focus_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    duration_minutes integer NOT NULL,
    completed_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT focus_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT focus_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.goals (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NULL,
    target_date date NULL,
    status text NULL DEFAULT 'in_progress'::text,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.media_content (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NULL,
    title text NOT NULL,
    author text NULL,
    category text NULL,
    content_type text NOT NULL,
    url text NULL,
    thumbnail_url text NULL,
    duration text NULL,
    text_content text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    is_completed boolean NULL DEFAULT false,
    is_favorite boolean NULL DEFAULT false,
    subject text NULL,
    CONSTRAINT media_content_pkey PRIMARY KEY (id),
    CONSTRAINT media_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.media_completion_log (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    media_id uuid NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT media_completion_log_pkey PRIMARY KEY (id),
    CONSTRAINT media_completion_log_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media_content (id) ON DELETE CASCADE,
    CONSTRAINT media_completion_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.quick_links (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    category text NULL,
    icon_url text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT quick_links_pkey PRIMARY KEY (id),
    CONSTRAINT quick_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.routines (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    category text NOT NULL,
    task text NOT NULL,
    completed boolean NULL DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT routines_pkey PRIMARY KEY (id),
    CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.schedule (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    activity text NOT NULL,
    category text NOT NULL,
    day_of_week integer NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    completed boolean NULL DEFAULT false,
    reminder_enabled boolean NULL DEFAULT false,
    template_name text NULL,
    CONSTRAINT schedule_pkey PRIMARY KEY (id),
    CONSTRAINT schedule_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.todos (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    task text NOT NULL,
    completed boolean NULL DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT now(),
    goal_id uuid NULL,
    completed_at timestamp with time zone NULL,
    parent_id uuid NULL,
    CONSTRAINT todos_pkey PRIMARY KEY (id),
    CONSTRAINT todos_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals (id) ON DELETE SET NULL,
    CONSTRAINT todos_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.todos (id) ON DELETE CASCADE,
    CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.user_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    metric_type text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT user_metrics_pkey PRIMARY KEY (id),
    CONSTRAINT user_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.user_profiles (
    id uuid NOT NULL,
    username text NULL,
    full_name text NULL,
    avatar_url text NULL,
    updated_at timestamp with time zone NULL,
    current_streak integer NULL,
    tasks_completed integer NULL,
    focus_sessions_completed integer NULL,
    total_focus_minutes integer NULL,
    custom_focus_duration integer NULL,
    custom_break_duration integer NULL,
    custom_meditation_duration integer NULL,
    notifications_push boolean NULL,
    notifications_email boolean NULL,
    notifications_quotes boolean NULL,
    weekly_focus text[] NULL,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT user_profiles_username_key UNIQUE (username)
  ) TABLESPACE pg_default;

CREATE TABLE
  public.vision_boards (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    title text NOT NULL,
    html_content text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL,
    CONSTRAINT vision_boards_pkey PRIMARY KEY (id),
    CONSTRAINT vision_boards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE TABLE
  public.voice_workflows (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    title text NOT NULL,
    task_type text NOT NULL,
    voice text NOT NULL,
    tone text NOT NULL,
    plugin_location text NOT NULL,
    trigger_time time without time zone NULL,
    trigger_activity text NULL,
    script text NOT NULL,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL,
    CONSTRAINT voice_workflows_pkey PRIMARY KEY (id),
    CONSTRAINT voice_workflows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  ) TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    username, 
    current_streak, 
    tasks_completed, 
    focus_sessions_completed, 
    total_focus_minutes, 
    custom_focus_duration, 
    custom_break_duration, 
    custom_meditation_duration, 
    notifications_push, 
    notifications_email, 
    notifications_quotes,
    weekly_focus
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    0, 0, 0, 0, 25, 5, 10, false, false, true, '{}'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_vision_board_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;