import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  MessageSquare, 
  Upload, 
  BarChart3, 
  Users, 
  Mic, 
  FileText, 
  TrendingUp,
  Brain,
  Globe,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized explanations and step-by-step solutions for PCM problems',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: 'Bilingual Support',
      description: 'Learn in Hindi or English - our AI adapts to your preferred language',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Mic,
      title: 'Voice Interaction',
      description: 'Ask questions by voice and hear explanations read aloud',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Smart Notes',
      description: 'Upload PDFs and get AI-generated summaries and flashcards',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Mock Tests',
      description: 'Practice with AI-generated questions and track your progress',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Collaborate with peers in real-time study rooms with AI assistance',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const quickActions = [
    {
      href: '/chat',
      icon: MessageSquare,
      title: 'Start Learning',
      description: 'Ask questions and get instant AI help',
      color: 'bg-primary'
    },
    {
      href: '/upload',
      icon: Upload,
      title: 'Upload Notes',
      description: 'Transform your PDFs into smart study material',
      color: 'bg-primary'
    },
    {
      href: '/tests',
      icon: TrendingUp,
      title: 'Take Test',
      description: 'Practice with adaptive mock tests',
      color: 'bg-primary'
    },
    {
      href: '/rooms',
      icon: Users,
      title: 'Study Together',
      description: 'Join or create study rooms',
      color: 'bg-primary'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Hero Section */}
      <section className="container px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground mr-4">
              <img src='https://i.pinimg.com/736x/bc/28/55/bc2855b4af523e649c17a50c81f020e5.jpg'/>
            </div>
            <span className="p-1 text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Study Buddy
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Master JEE with
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"> AI Intelligence</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your bilingual AI tutor for Physics, Chemistry, and Mathematics. 
            Get instant explanations, practice tests, and collaborate with peers - all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild className="text-lg px-8 animate-pulse-glow">
                <Link to="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Learning Now
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8 animate-pulse-glow">
                  <Link to="/auth">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
            Everything You Need to Ace JEE
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for JEE preparation, powered by advanced AI technology
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quick Actions Section */}
      {user && (
        <section className="container px-4 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
              Quick Actions
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground">
              Jump right into your study session
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {quickActions.map((action, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={action.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5 text-background" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{action.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="container px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your JEE Prep?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using AI to excel in their JEE preparation
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Your Journey
              </Link>
            </Button>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Home;