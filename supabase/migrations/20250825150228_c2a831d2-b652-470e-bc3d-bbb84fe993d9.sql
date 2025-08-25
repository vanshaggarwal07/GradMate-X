-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  graduation_year INTEGER,
  degree TEXT,
  major TEXT,
  current_company TEXT,
  current_position TEXT,
  location TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  is_mentor BOOLEAN DEFAULT FALSE,
  is_available_for_mentorship BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship table
CREATE TABLE public.mentorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Create job opportunities table
CREATE TABLE public.job_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'internship', 'contract')),
  salary_range TEXT,
  requirements TEXT,
  application_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral requests table
CREATE TABLE public.referral_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create one-on-one sessions table
CREATE TABLE public.one_on_one_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alumni events table
CREATE TABLE public.alumni_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('networking', 'career_fair', 'social', 'educational', 'reunion')),
  max_attendees INTEGER,
  registration_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event attendees table
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.alumni_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mentorships
CREATE POLICY "Users can view their own mentorships" 
ON public.mentorships FOR SELECT 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create mentorship requests" 
ON public.mentorships FOR INSERT 
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors can update mentorship status" 
ON public.mentorships FOR UPDATE 
USING (auth.uid() = mentor_id);

-- Create RLS policies for job opportunities
CREATE POLICY "Job opportunities are viewable by everyone" 
ON public.job_opportunities FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create job opportunities" 
ON public.job_opportunities FOR INSERT 
WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update their own job opportunities" 
ON public.job_opportunities FOR UPDATE 
USING (auth.uid() = posted_by);

-- Create RLS policies for referral requests
CREATE POLICY "Users can view relevant referral requests" 
ON public.referral_requests FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = referee_id OR status = 'open');

CREATE POLICY "Users can create referral requests" 
ON public.referral_requests FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update referral requests they're involved in" 
ON public.referral_requests FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = referee_id);

-- Create RLS policies for one-on-one sessions
CREATE POLICY "Users can view their own sessions" 
ON public.one_on_one_sessions FOR SELECT 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create sessions" 
ON public.one_on_one_sessions FOR INSERT 
WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can update their own sessions" 
ON public.one_on_one_sessions FOR UPDATE 
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Create RLS policies for alumni events
CREATE POLICY "Alumni events are viewable by everyone" 
ON public.alumni_events FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create alumni events" 
ON public.alumni_events FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
ON public.alumni_events FOR UPDATE 
USING (auth.uid() = created_by);

-- Create RLS policies for event attendees
CREATE POLICY "Event attendees are viewable by everyone" 
ON public.event_attendees FOR SELECT 
USING (true);

CREATE POLICY "Users can register for events" 
ON public.event_attendees FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" 
ON public.event_attendees FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at
  BEFORE UPDATE ON public.mentorships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_opportunities_updated_at
  BEFORE UPDATE ON public.job_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_requests_updated_at
  BEFORE UPDATE ON public.referral_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_one_on_one_sessions_updated_at
  BEFORE UPDATE ON public.one_on_one_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alumni_events_updated_at
  BEFORE UPDATE ON public.alumni_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER TABLE public.mentorships REPLICA IDENTITY FULL;
ALTER TABLE public.one_on_one_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.alumni_events REPLICA IDENTITY FULL;
ALTER TABLE public.event_attendees REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.one_on_one_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;