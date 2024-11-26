import OpenAI from 'openai';
import { config } from '../config/config.js';
import redis from '../config/redis.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const CONVERSATION_EXPIRY = 60 * 60; // 1 hour

export const openaiService = {
  async processResume(resumeText, userId) {
    const sessionId = `session_${Date.now()}_${userId}`;
    
    const systemMessage = {
      role: 'system',
      content: `You are the candidate in a job interview. Respond based on this resume:\n\n${resumeText}\n\nUse casual Indian English, be conversational, and maintain the persona of the actual candidate.`
    };

    await redis.setex(
      `resume:${sessionId}`,
      CONVERSATION_EXPIRY,
      JSON.stringify({
        messages: [systemMessage],
        context: resumeText,
        userId
      })
    );

    return { sessionId };
  },

  async generateResponse(question, sessionId, userId) {
    const sessionKey = `resume:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      throw new Error('Session expired. Please start a new interview.');
    }

    const session = JSON.parse(sessionData);
    if (session.userId !== userId) {
      throw new Error('Invalid session access');
    }

    const messages = [...session.messages];
    messages.push({ role: 'user', content: question });

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.9,
        max_tokens: 350,
        presence_penalty: 0.7,
        frequency_penalty: 0.5
      });

      const answer = response.choices[0]?.message?.content;
      messages.push({ role: 'assistant', content: answer });

      // Update session with new messages
      await redis.setex(
        sessionKey,
        CONVERSATION_EXPIRY,
        JSON.stringify({ ...session, messages })
      );

      return { answer };
    } catch (error) {
      if (error?.error?.code === 'context_length_exceeded') {
        // Reset conversation but keep system message and last question
        const newMessages = [
          messages[0],
          { role: 'user', content: question }
        ];

        const retryResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: newMessages,
          temperature: 0.9,
          max_tokens: 350
        });

        const answer = retryResponse.choices[0]?.message?.content;
        newMessages.push({ role: 'assistant', content: answer });

        await redis.setex(
          sessionKey,
          CONVERSATION_EXPIRY,
          JSON.stringify({ ...session, messages: newMessages })
        );

        return { answer };
      }
      throw error;
    }
  }
};