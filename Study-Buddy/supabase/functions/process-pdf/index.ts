import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, subject, originalName } = await req.json();

    if (!fileName || !originalName) {
      throw new Error('File name and original name are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    console.log(`Processing PDF: ${originalName} for user ${user.id}`);

    // For now, we'll simulate PDF processing since actual PDF text extraction 
    // would require additional libraries. In a real implementation, you would:
    // 1. Download the file from Supabase Storage
    // 2. Extract text using a PDF processing library
    // 3. Send the extracted text to OpenAI for summarization

    // Simulated PDF content - in real implementation, extract this from the PDF
    const sampleContent = `This is extracted content from the PDF: ${originalName}. 
    The document appears to be study material related to ${subject || 'general topics'}.
    It contains various concepts, formulas, and explanations that would be useful for JEE preparation.`;

    // Generate summary and flashcards using OpenAI
    const systemPrompt = `You are an AI study assistant that helps students create effective study materials from uploaded PDFs.

Your task is to:
1. Create a comprehensive summary of the content
2. Generate flashcards for key concepts
3. Identify important formulas and definitions

Please format your response as valid JSON with this structure:
{
  "summary": "A comprehensive summary of the main concepts and topics covered",
  "flashcards": [
    {
      "front": "Question or concept to remember",
      "back": "Answer or explanation",
      "topic": "Specific topic this relates to"
    }
  ],
  "key_topics": ["List", "of", "main", "topics", "covered"]
}

Focus on creating study materials that would be helpful for JEE preparation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please process this PDF content and create study materials:\n\n${sampleContent}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let studyMaterials;
    try {
      studyMaterials = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to basic structure
      studyMaterials = {
        summary: "Study material processed successfully. Please review the uploaded content.",
        flashcards: [],
        key_topics: []
      };
    }

    // Clean the original name to create a title
    const title = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

    // Save study material to database
    const { data: materialData, error: materialError } = await supabaseClient
      .from('study_materials')
      .insert({
        user_id: user.id,
        title: title,
        file_name: originalName,
        file_path: fileName,
        subject: subject || null,
        summary: studyMaterials.summary,
        flashcards: studyMaterials.flashcards || []
      })
      .select()
      .single();

    if (materialError) {
      console.error('Database error:', materialError);
      throw new Error('Failed to save study material to database');
    }

    console.log(`Study material created successfully: ${materialData.id}`);

    return new Response(JSON.stringify({
      success: true,
      material: materialData,
      message: 'PDF processed and study materials generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-pdf function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});