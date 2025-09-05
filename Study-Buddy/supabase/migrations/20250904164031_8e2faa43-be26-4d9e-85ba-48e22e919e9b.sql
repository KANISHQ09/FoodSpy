-- Create enum types
CREATE TYPE public.subject_type AS ENUM ('physics', 'chemistry', 'mathematics');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.question_type AS ENUM ('mcq', 'numerical', 'subjective');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  grade INTEGER DEFAULT 12,
  target_exam TEXT DEFAULT 'JEE Main',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table for AI conversations
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  subject subject_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  is_voice BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'english' CHECK (language IN ('english', 'hindi', 'mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_materials table for uploaded documents
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  subject subject_type,
  summary TEXT,
  flashcards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table for mock tests
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject subject_type NOT NULL,
  difficulty difficulty_level DEFAULT 'medium',
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 180,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_attempts table for tracking test performance
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_taken_minutes INTEGER,
  answers JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_rooms table for group collaboration
CREATE TABLE public.study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject subject_type,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_participants table for tracking room membership
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create room_messages table for study room chat
CREATE TABLE public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'question', 'answer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chats
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages from own chats" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages in own chats" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

-- Create RLS policies for study materials
CREATE POLICY "Users can view own study materials" ON public.study_materials
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own study materials" ON public.study_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study materials" ON public.study_materials
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study materials" ON public.study_materials
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tests
CREATE POLICY "Users can view own tests" ON public.tests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tests" ON public.tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for test attempts
CREATE POLICY "Users can view own test attempts" ON public.test_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own test attempts" ON public.test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for study rooms
CREATE POLICY "Everyone can view active study rooms" ON public.study_rooms
  FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create study rooms" ON public.study_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update their rooms" ON public.study_rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for room participants
CREATE POLICY "Users can view room participants for joined rooms" ON public.room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp2
      WHERE rp2.room_id = room_participants.room_id 
      AND rp2.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can join rooms" ON public.room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for room messages
CREATE POLICY "Room participants can view messages" ON public.room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_participants.room_id = room_messages.room_id 
      AND room_participants.user_id = auth.uid()
    )
  );
CREATE POLICY "Room participants can send messages" ON public.room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_participants.room_id = room_messages.room_id 
      AND room_participants.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();