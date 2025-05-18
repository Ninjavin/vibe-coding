'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  FireIcon, 
  FaceSmileIcon,
  HandRaisedIcon,
  BeakerIcon,
  SparklesIcon,
  HeartIcon,
  ArrowLeftIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import Groq from 'groq-sdk';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

type ToneType = 'passive-aggressive' | 'humorous' | 'sarcastic' | 'savage' | 'tech-savvy' | 'high-iq' | 'peacemaker';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const TONES: Record<ToneType, { icon: any; label: string; description: string; example: string; gradient: string; shadow: string }> = {
  'passive-aggressive': {
    icon: HandRaisedIcon,
    label: 'Passive-Aggressive',
    description: 'Subtle jabs wrapped in politeness',
    example: 'Thanks for your input! I\'ll give it the attention it deserves 😊',
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-rose-500/20'
  },
  'humorous': {
    icon: FaceSmileIcon,
    label: 'Humorous',
    description: 'Witty and light-hearted',
    example: 'Sorry I missed the meeting, my cat was giving a TED talk',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-orange-500/20'
  },
  'sarcastic': {
    icon: ChatBubbleLeftRightIcon,
    label: 'Sarcastic',
    description: 'Sharp wit with a dash of irony',
    example: 'Oh wow, what an absolutely unique perspective!',
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-purple-500/20'
  },
  'savage': {
    icon: FireIcon,
    label: 'Savage Roast',
    description: 'No holds barred comebacks',
    example: 'I\'d explain it to you, but I ran out of crayons',
    gradient: 'from-red-500 to-rose-500',
    shadow: 'shadow-rose-500/20'
  },
  'tech-savvy': {
    icon: BeakerIcon,
    label: 'Tech Savvy',
    description: 'Geek-speak and tech references',
    example: 'Let me debug your logic there...',
    gradient: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-blue-500/20'
  },
  'high-iq': {
    icon: SparklesIcon,
    label: 'High Context IQ',
    description: 'Sheldon Cooper-style responses',
    example: 'Your argument reminds me of a fascinating quantum paradox...',
    gradient: 'from-indigo-500 to-blue-500',
    shadow: 'shadow-blue-500/20'
  },
  'peacemaker': {
    icon: HeartIcon,
    label: 'Peacemaker',
    description: 'Diplomatic and solution-focused',
    example: 'I see where you\'re coming from, and here\'s a thought...',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-teal-500/20'
  }
};

const REPLY_PROMPT = `You are an expert in crafting perfect replies with different tones. Given this message/email:

"{message}"

Generate 3 different clever replies in the "{tone}" tone. Each reply should be different in approach but maintain the same tone. Consider the context and social dynamics.

Format your response as a JSON array of objects:
{
  "replies": [
    {
      "reply": "the reply text"
    }
  ]
}

Make the replies creative, contextual, and true to the selected tone.`;

export default function ReplyCraft() {
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('passive-aggressive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replies, setReplies] = useState<Array<{ reply: string }> | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateReplies = async () => {
    try {
      setError('');
      setIsGenerating(true);
      setReplies(null);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: REPLY_PROMPT
              .replace('{message}', message)
              .replace('{tone}', TONES[selectedTone].label)
          }
        ],
        model: 'gemma2-9b-it',
        temperature: 0.9,
        max_tokens: 1024,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Groq');

      // Extract JSON content and handle potential code blocks
      let jsonContent = result;
      if (result.includes('```json')) {
        jsonContent = result.split('```json')[1].split('```')[0];
      } else if (result.includes('```')) {
        jsonContent = result.split('```')[1].split('```')[0];
      }

      // Clean up the JSON string more carefully
      const cleanJson = jsonContent
        .replace(/[\n\r\t]/g, '') // Remove newlines, carriage returns, and tabs
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/"\s+}/g, '"}') // Remove spaces before closing braces
        .replace(/}\s+,/g, '},') // Remove spaces between comma-separated objects
        .replace(/"\s+,/g, '",') // Remove spaces before commas
        .replace(/,\s+"/g, ',"') // Remove spaces after commas
        .replace(/\s+{/g, '{') // Remove spaces before opening braces
        .replace(/{\s+"/g, '{"') // Remove spaces after opening braces
        .replace(/\\([^"\\])/g, '$1') // Remove unnecessary escapes except for quotes and backslashes
        .trim();

      const parsedReplies = JSON.parse(cleanJson);
      if (!parsedReplies.replies || !Array.isArray(parsedReplies.replies)) {
        throw new Error('Invalid response format');
      }
      setReplies(parsedReplies.replies);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate replies. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await generateReplies();
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-30"></div>
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex justify-between items-center">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm">Powered by Groq</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 text-transparent bg-clip-text">
              ReplyCraft
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Craft the perfect reply for any situation with style! 💬✨
            </p>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 blur-3xl -z-10"></div>
            <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Paste the message you received... (e.g., 'Per my last email...' or 'Just checking in on that task...')"
                    className="w-full px-6 py-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4 text-center">
                    Pick Your Tone
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.keys(TONES) as ToneType[]).map((tone) => {
                      const details = TONES[tone];
                      const Icon = details.icon;
                      return (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setSelectedTone(tone)}
                          className={`relative group p-4 rounded-xl transition-all duration-300 ${
                            selectedTone === tone
                              ? `bg-gradient-to-r ${details.gradient} ${details.shadow} shadow-lg`
                              : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/80'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <Icon className={`w-6 h-6 ${selectedTone === tone ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                            <h3 className={`font-medium ${selectedTone === tone ? 'text-white' : 'text-gray-900 dark:text-gray-300'}`}>
                              {details.label}
                            </h3>
                            <p className={`text-xs ${selectedTone === tone ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                              {details.description}
                            </p>
                          </div>
                          {selectedTone === tone && (
                            <motion.div
                              layoutId="active-tone"
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50 -z-10"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    isGenerating || !message.trim()
                      ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]'
                  }`}
                  disabled={isGenerating || !message.trim()}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Crafting replies</span>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-current"
                        />
                      </div>
                    </div>
                  ) : (
                    'Generate Replies'
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 dark:text-red-400 text-center mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4"
              >
                {error}
              </motion.div>
            )}

            {!isGenerating && replies && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {replies.map((reply, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                    <div className="relative p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                          Reply Option {index + 1}
                        </h3>
                        <button
                          onClick={() => handleCopy(index, reply.reply)}
                          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm group/copy"
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckIcon className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-4 h-4" />
                              <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-lg">"{reply.reply}"</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
} 