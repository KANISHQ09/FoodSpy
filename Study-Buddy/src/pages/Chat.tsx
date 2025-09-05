import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Plus, 
  MessageSquare,
  Bot,
  User,
  Languages,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  is_voice: boolean;
  language: 'english' | 'hindi' | 'mixed';
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'mathematics' | null;
  created_at: string;
  updated_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subject, setSubject] = useState<string>('');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'mixed'>('english');
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title: 'New Chat',
          subject: (subject as 'physics' | 'chemistry' | 'mathematics') || null
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentChat(data);
      setMessages([]);
      loadChats();

      toast({
        title: "New chat created",
        description: "Start asking your questions!",
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentChat || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add user message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: currentChat.id,
          role: 'user',
          content: userMessage,
          is_voice: false,
          language: language
        }]);

      if (messageError) throw messageError;

      // Add user message to UI
      const newUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userMessage,
        is_voice: false,
        language: language,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newUserMessage]);

      // Call AI API
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          subject: currentChat.subject,
          language: language,
          chatHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });

      if (error) throw error;

      const aiResponse = data?.response || "I'm sorry, I couldn't process your request.";

      // Add AI response to database
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: currentChat.id,
          role: 'assistant',
          content: aiResponse,
          is_voice: false,
          language: language
        }]);

      if (aiMessageError) throw aiMessageError;

      // Add AI message to UI
      const newAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        is_voice: false,
        language: language,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Update chat title if it's the first message
      if (messages.length === 0) {
        const title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
        await supabase
          .from('chats')
          .update({ title })
          .eq('id', currentChat.id);
        
        setCurrentChat({ ...currentChat, title });
        loadChats();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    // Voice recognition will be implemented with the AI integration
    setIsListening(!isListening);
    toast({
      title: "Voice Feature",
      description: "Voice input feature coming soon!",
    });
  };

  const toggleSpeaking = () => {
    // Text-to-speech will be implemented with the AI integration
    setIsSpeaking(!isSpeaking);
    toast({
      title: "Voice Feature",
      description: "Text-to-speech feature coming soon!",
    });
  };

  const getSubjectIcon = (subject: string | null) => {
    switch (subject) {
      case 'physics': return '⚛️';
      case 'chemistry': return '🧪';
      case 'mathematics': return '📐';
      default: return '📚';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to Chat</h2>
            <p className="text-muted-foreground">Please sign in to start chatting with your AI study buddy.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card/50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button size="sm" onClick={createNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">हिंदी</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChat?.id === chat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
                onClick={() => {
                  setCurrentChat(chat);
                  loadMessages(chat.id);
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">{getSubjectIcon(chat.subject)}</span>
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{chat.title}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSubjectIcon(currentChat.subject)}</span>
                  <div>
                    <h3 className="font-semibold">{currentChat.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentChat.subject || 'General'} • {language}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Languages className="h-3 w-3" />
                    <span className="capitalize">{language}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-card/50 p-4">
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleListening}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Physics, Chemistry, or Math..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                />
                
                <Button
                  size="icon"
                  variant={isSpeaking ? "default" : "outline"}
                  onClick={toggleSpeaking}
                >
                  {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                
                <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <CardContent>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Start a New Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Create a new chat to begin asking questions and get AI-powered explanations.
                </p>
                <Button onClick={createNewChat}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;