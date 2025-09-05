import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload as UploadIcon, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StudyMaterial {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  subject: 'physics' | 'chemistry' | 'mathematics' | null;
  summary: string | null;
  flashcards: any[];
  created_at: string;
}

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMaterials = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials((data || []) as StudyMaterial[]);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }, [user]);

  const handleFileUpload = async (file: File) => {
    if (!file || !user) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Process the file with AI
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          fileName,
          subject: selectedSubject,
          originalName: file.name
        }
      });

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "File uploaded successfully!",
        description: "Your PDF has been processed and notes generated.",
      });

      loadMaterials();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const deleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      toast({
        title: "Material deleted",
        description: "The study material has been removed.",
      });

      loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error",
        description: "Failed to delete material.",
        variant: "destructive",
      });
    }
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
            <h2 className="text-2xl font-bold mb-2">Sign in to Upload</h2>
            <p className="text-muted-foreground">Please sign in to upload and manage your study materials.</p>
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
          <h1 className="text-3xl font-bold mb-4">Upload Study Materials</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your PDFs and let our AI transform them into smart study materials with summaries and flashcards
          </p>
        </div>

        {/* Upload Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>
              Drag and drop your PDF file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-4">
                  {isUploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : (
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  
                  <div>
                    <p className="text-lg font-medium">
                      {isUploading ? 'Processing...' : 'Drop PDF here or click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF files up to 10MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Study Materials</h2>
            <Button onClick={loadMaterials} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {materials.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No materials yet</h3>
                <p className="text-muted-foreground">
                  Upload your first PDF to get started with AI-powered study materials
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>{getSubjectIcon(material.subject)}</span>
                          <span className="capitalize">{material.subject || 'General'}</span>
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => {}}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg truncate">{material.title}</CardTitle>
                      <CardDescription className="truncate">{material.file_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {material.summary && (
                        <div>
                          <p className="text-sm font-medium mb-1">Summary:</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {material.summary}
                          </p>
                        </div>
                      )}
                      
                      {material.flashcards && material.flashcards.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {material.flashcards.length} flashcards generated
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Uploaded {new Date(material.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;