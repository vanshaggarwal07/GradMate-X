-- Create one_on_one_sessions table
CREATE TABLE IF NOT EXISTS public.one_on_one_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    meeting_link TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.one_on_one_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for users based on user_id" 
ON public.one_on_one_sessions
FOR SELECT
TO authenticated
USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

CREATE POLICY "Enable insert for authenticated users"
ON public.one_on_one_sessions
FOR INSERT
TO authenticated
WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Enable update for session participants"
ON public.one_on_one_sessions
FOR UPDATE
TO authenticated
USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- Create index for better query performance
CREATE INDEX idx_one_on_one_sessions_mentor_id ON public.one_on_one_sessions(mentor_id);
CREATE INDEX idx_one_on_one_sessions_mentee_id ON public.one_on_one_sessions(mentee_id);
CREATE INDEX idx_one_on_one_sessions_scheduled_at ON public.one_on_one_sessions(scheduled_at);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_one_on_one_sessions_updated_at
BEFORE UPDATE ON public.one_on_one_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
