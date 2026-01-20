
export enum Tone {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  HUMOROUS = 'Humorous',
  SARCASTIC = 'Sarcastic',
  SUPPORTIVE = 'Supportive',
  CONTROVERSIAL = 'Controversial',
  INSIGHTFUL = 'Insightful'
}

export enum ReplyLength {
  SHORT = 'Short',
  MEDIUM = 'Medium',
  LONG = 'Long'
}

export interface TweetReply {
  id: string;
  originalUrl: string;
  tweetId: string;
  generatedText: string;
  status: 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';
  error?: string;
}

export interface GenerationSettings {
  tone: Tone;
  length: ReplyLength;
  customPrompt?: string;
}
