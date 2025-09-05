import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, MessageSquare, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Rooms = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in for Study Rooms</h2>
            <p className="text-muted-foreground">Please sign in to join or create study rooms.</p>
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
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Study Rooms</h1>
        <p className="text-muted-foreground mb-8">Collaborate with peers in real-time study sessions</p>
        
        <Card className="p-8">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Study Rooms Coming Soon!</h3>
            <p className="text-muted-foreground">
              Real-time collaboration features will be available soon. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Rooms;