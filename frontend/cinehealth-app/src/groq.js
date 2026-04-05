import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const getChatResponse = async (userMessage, detectedMood, movies) => {
  const movieList = movies.map(m => m.title).join(', ');
  
  const systemPrompt = `You are CineHealth, a warm and empathetic AI wellness companion that recommends movies based on emotions. 

Your personality:
- Caring, supportive, and non-judgmental
- You understand emotions deeply
- You connect movies to emotional healing
- Keep responses SHORT (2-3 sentences max)
- Never recommend movies yourself — the system does that
- If the user seems in distress, be extra gentle

Current context:
- Detected mood: ${detectedMood}
- Movies recommended: ${movieList}

Respond naturally to what the user said. Acknowledge their feeling, then briefly explain why these movies suit their current mood.`;

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    model: 'llama-3.3-70b-versatile',
    max_tokens: 150
  });

  return response.choices[0]?.message?.content || "I'm here for you! Check out these movies.";
};