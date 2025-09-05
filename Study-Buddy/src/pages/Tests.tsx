import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen,
  Plus,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Test {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'mathematics';
  difficulty: 'easy' | 'medium' | 'hard';
  total_questions: number;
  duration_minutes: number;
  created_at: string;
}

interface TestAttempt {
  id: string;
  test_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes: number | null;
  completed_at: string;
  test: Test;
}

const Tests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadTests();
      loadAttempts();
    }
  }, [user]);

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          test:tests(*)
        `)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const generateTest = async () => {
    if (!user || !selectedSubject || !selectedDifficulty) {
      toast({
        title: "Please select options",
        description: "Choose both subject and difficulty level.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-test', {
        body: {
          subject: selectedSubject,
          difficulty: selectedDifficulty,
          questionCount: 15
        }
      });

      if (error) throw error;

      toast({
        title: "Test generated!",
        description: `New ${selectedSubject} test created successfully.`,
      });

      loadTests();
    } catch (error) {
      console.error('Error generating test:', error);
      toast({
        title: "Error",
        description: "Failed to generate test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'physics': return '⚛️';
      case 'chemistry': return '🧪';
      case 'mathematics': return '📐';
      default: return '📚';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  const calculateAverageScore = () => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions) * 100, 0);
    return Math.round(total / attempts.length);
  };

  const getStrongSubject = () => {
    if (attempts.length === 0) return 'None yet';
    const subjectScores: { [key: string]: number[] } = {};
    
    attempts.forEach(attempt => {
      if (attempt.test) {
        const subject = attempt.test.subject;
        const score = (attempt.score / attempt.total_questions) * 100;
        if (!subjectScores[subject]) subjectScores[subject] = [];
        subjectScores[subject].push(score);
      }
    });

    let bestSubject = 'None';
    let bestAverage = 0;

    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (average > bestAverage) {
        bestAverage = average;
        bestSubject = subject;
      }
    });

    return bestSubject;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in for Tests</h2>
            <p className="text-muted-foreground">Please sign in to take mock tests and track your progress.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Mock Tests & Analytics</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practice with AI-generated questions and track your progress across all JEE subjects
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attempts.length}</div>
              <p className="text-xs text-muted-foreground">
                Total practice sessions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverageScore()}%</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strong Subject</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{getStrongSubject()}</div>
              <p className="text-xs text-muted-foreground">
                Best performing area
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Generate New Test */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Test</CardTitle>
            <CardDescription>
              Create a customized mock test with AI-generated questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateTest} 
              disabled={isGenerating || !selectedSubject || !selectedDifficulty}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Generating Test...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Test (15 Questions)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Available Tests */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Available Tests</h2>
          
          {tests.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No tests available</h3>
                <p className="text-muted-foreground">
                  Generate your first test to start practicing!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>{getSubjectIcon(test.subject)}</span>
                          <span className="capitalize">{test.subject}</span>
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(test.difficulty)}
                        >
                          {test.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <CardDescription>
                        {test.total_questions} questions • {test.duration_minutes} minutes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{test.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{test.total_questions} questions</span>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <Play className="mr-2 h-4 w-4" />
                        Start Test
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Attempts */}
        {attempts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Test Results</h2>
            
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getSubjectIcon(attempt.test?.subject || '')}</span>
                            <div>
                              <h3 className="font-semibold">{attempt.test?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {Math.round((attempt.score / attempt.total_questions) * 100)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-semibold">
                              {attempt.correct_answers}/{attempt.total_questions}
                            </div>
                            <p className="text-xs text-muted-foreground">Correct</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-semibold">
                              {attempt.time_taken_minutes || 0}m
                            </div>
                            <p className="text-xs text-muted-foreground">Time</p>
                          </div>
                          
                          <div className="flex items-center">
                            {attempt.score / attempt.total_questions >= 0.8 ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : attempt.score / attempt.total_questions >= 0.6 ? (
                              <AlertCircle className="h-6 w-6 text-yellow-600" />
                            ) : (
                              <AlertCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Progress 
                          value={(attempt.score / attempt.total_questions) * 100} 
                          className="w-full" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Tests;