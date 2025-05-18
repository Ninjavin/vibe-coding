'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentCheckIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import Groq from 'groq-sdk';
import Link from 'next/link';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const ALIBI_PROMPT = `You are a creative alibi generator that helps people explain awkward situations. Given the situation: '{situation}', generate:
1. A detailed, believable story (2-3 paragraphs)
2. 3-4 specific details to make it more convincing
3. A list of potential "evidence" that could support the story (like screenshots, receipts, etc.)
4. A short one-liner excuse for quick responses

Format the response as a JSON object with keys:
{
  "story": "detailed story here",
  "details": ["detail1", "detail2", "detail3"],
  "evidence": ["evidence1", "evidence2", "evidence3"],
  "quickExcuse": "short excuse here"
}

Make the story modern, relatable, and include realistic tech-related elements when appropriate.`;

export default function AlibiGenerator() {
  const [situation, setSituation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alibi, setAlibi] = useState<{
    story: string;
    details: string[];
    evidence: string[];
    quickExcuse: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [copiedExcuse, setCopiedExcuse] = useState(false);

  const generateAlibi = async () => {
    try {
      setError('');
      setIsGenerating(true);
      setAlibi(null);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: ALIBI_PROMPT.replace('{situation}', situation)
          }
        ],
        model: 'gemma2-9b-it',
        temperature: 0.9,
        max_tokens: 1024,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) throw new Error('No response from Groq');

      // Extract JSON content from code block if present
      const jsonContent = result.includes('```json')
        ? result.split('```json\n')[1].split('```')[0]
        : result;

      // Clean up the JSON string
      const cleanJson = jsonContent
        .replace(/\n/g, '')
        .replace(/\\/g, '')
        .trim();

      const parsedAlibi = JSON.parse(cleanJson);
      setAlibi(parsedAlibi);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate alibi. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;
    await generateAlibi();
  };

  const handleCopyExcuse = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExcuse(true);
    setTimeout(() => setCopiedExcuse(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-900 to-black text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex justify-between items-center">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm">Powered by Groq</span>
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
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-transparent bg-clip-text">
              Digital Alibi Generator
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Turn your awkward situations into believable stories! 🕵️‍♂️✨
            </p>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-3xl -z-10"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Describe the situation you need an alibi for... (e.g., 'Missed a deadline for an important project' or 'Need to get out of a social event')"
                    className="w-full px-6 py-4 rounded-xl bg-gray-800/50 border-2 border-gray-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-white placeholder-gray-500 text-lg min-h-[120px] resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    isGenerating || !situation.trim()
                      ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02]'
                  }`}
                  disabled={isGenerating || !situation.trim()}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Crafting your alibi</span>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    'Generate Alibi'
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
                className="text-red-400 text-center mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                {error}
              </motion.div>
            )}

            {!isGenerating && alibi && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Quick Excuse Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
                  <div className="relative p-6 rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800/50 hover:border-teal-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-300">
                        Quick Excuse
                      </h3>
                      <button
                        onClick={() => handleCopyExcuse(alibi.quickExcuse)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group/copy"
                      >
                        {copiedExcuse ? (
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
                    <p className="text-gray-300 text-lg">"{alibi.quickExcuse}"</p>
                  </div>
                </motion.div>

                {/* Detailed Story Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl"></div>
                  <div className="relative p-6 rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">
                      Your Detailed Story
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {alibi.story}
                    </p>
                  </div>
                </motion.div>

                {/* Key Details Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl"></div>
                  <div className="relative p-6 rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">
                      Key Details to Remember
                    </h3>
                    <ul className="space-y-3">
                      {alibi.details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Supporting Evidence Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl"></div>
                  <div className="relative p-6 rounded-xl bg-gray-900/50 backdrop-blur border border-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">
                      Supporting "Evidence"
                    </h3>
                    <ul className="space-y-3">
                      {alibi.evidence.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <DocumentCheckIcon className="w-6 h-6 text-teal-500 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
} 