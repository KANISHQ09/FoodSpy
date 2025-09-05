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
    const { subject, difficulty, questionCount = 15 } = await req.json();

    if (!subject || !difficulty) {
      throw new Error('Subject and difficulty are required');
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

    console.log(`Generating ${questionCount} ${difficulty} ${subject} questions for user ${user.id}`);

    // Generate questions using OpenAI
    const systemPrompt = `You are an expert JEE question generator. Generate ${questionCount} multiple choice questions for ${subject} at ${difficulty} level.

For each question, provide:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer (letter)
4. Detailed explanation
5. Topic/concept covered
6. Difficulty justification

Format as valid JSON array with this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "B",
      "explanation": "Detailed explanation of why B is correct",
      "topic": "Specific topic/concept",
      "difficulty_reason": "Why this is ${difficulty} level"
    }
  ]
}

Subject-specific guidelines:
- Physics: Include numerical problems, concepts, laws
- Chemistry: Cover organic, inorganic, physical chemistry
- Mathematics: Include calculus, algebra, geometry, trigonometry

Ensure questions are:
- JEE Main/Advanced style
- Conceptually accurate
- Appropriately challenging for ${difficulty} level
- Well-formatted with clear options`;

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
            content: `Generate ${questionCount} ${difficulty} level ${subject} questions for JEE preparation.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
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
    let questionsData;
    try {
      questionsData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid questions format from AI');
    }

    // Create test title
    const testTitle = `${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`;

    // Save test to database
    const { data: testData, error: testError } = await supabaseClient
      .from('tests')
      .insert({
        user_id: user.id,
        title: testTitle,
        subject: subject,
        difficulty: difficulty,
        total_questions: questionsData.questions.length,
        duration_minutes: Math.max(questionsData.questions.length * 2, 30), // 2 minutes per question, minimum 30
        questions: questionsData.questions
      })
      .select()
      .single();

    if (testError) {
      console.error('Database error:', testError);
      throw new Error('Failed to save test to database');
    }

    console.log(`Test created successfully: ${testData.id}`);

    return new Response(JSON.stringify({
      success: true,
      test: testData,
      message: `Generated ${questionsData.questions.length} questions successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-test function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});