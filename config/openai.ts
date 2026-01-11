import OpenAI from 'openai';
import Constants from 'expo-constants';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

// Supported languages for translation
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export type Language = typeof SUPPORTED_LANGUAGES[0];

// Translation function
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (!text.trim()) return text;
  
  const languageName = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator for children's storybooks. Translate the following text to ${languageName}. Keep it child-friendly, maintain the narrative flow, and preserve any special formatting or punctuation. Only return the translated text, nothing else.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Generate story from prompt (optional feature)
export async function generateStoryContent(
  prompt: string,
  language: string = 'en'
): Promise<{ title: string; pages: { imagePrompt: string; text: string }[] }> {
  const languageName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative children's story writer. Create a short children's story (5 pages) based on the given prompt. Write in ${languageName}. For each page, provide:
1. A brief text snippet (2-3 sentences) suitable for that page
2. An image generation prompt describing what the illustration should look like

Format your response as a JSON object with this structure:
{
  "title": "Story Title",
  "pages": [
    { "text": "Page text here", "imagePrompt": "Description for image generation" }
  ]
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Story generation error:', error);
    throw error;
  }
}

export default openai;
