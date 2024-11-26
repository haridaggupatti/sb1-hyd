import OpenAI from 'openai';
import { delay } from '../utils/helpers';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Memory store for conversations
interface ConversationMemory {
  messages: any[];
  context: string;
  lastActive: number;
}

const conversationMemory: Record<string, ConversationMemory> = {};

// Shared user store with persistent storage
const USER_STORE_KEY = 'user_store';

export const userStore = {
  users: JSON.parse(localStorage.getItem(USER_STORE_KEY) || JSON.stringify({
    'test@example.com': {
      id: '1',
      password: 'password123',
      role: 'user',
      isActive: true,
      createdAt: '2024-03-01T00:00:00Z',
      lastLoginAt: '2024-03-19T10:00:00Z',
      loginCount: 5
    },
    'admin@example.com': {
      id: '2',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      createdAt: '2024-03-01T00:00:00Z',
      lastLoginAt: '2024-03-19T11:00:00Z',
      loginCount: 10
    }
  })),

  save() {
    localStorage.setItem(USER_STORE_KEY, JSON.stringify(this.users));
  },

  addUser(email: string, userData: any) {
    this.users[email] = {
      ...userData,
      loginCount: 0,
      lastLoginAt: null
    };
    this.save();
  },

  updateUser(email: string, userData: any) {
    if (this.users[email]) {
      this.users[email] = {
        ...this.users[email],
        ...userData
      };
      this.save();
    }
  },

  deleteUser(email: string) {
    delete this.users[email];
    this.save();
  },

  getUser(email: string) {
    return this.users[email];
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    await delay(800);

    const user = userStore.getUser(email);
    if (!user || user.password !== password || !user.isActive) {
      throw new Error('Invalid email or password');
    }

    // Update login stats
    userStore.updateUser(email, {
      lastLoginAt: new Date().toISOString(),
      loginCount: (user.loginCount || 0) + 1
    });

    const token = btoa(JSON.stringify({ 
      id: user.id,
      email, 
      role: user.role 
    }));
    localStorage.setItem('access_token', token);

    return {
      user: {
        id: user.id,
        email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      },
      token
    };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('session_id');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const { id, email, role } = JSON.parse(atob(token));
      const user = userStore.getUser(email);
      
      return user ? {
        id,
        email,
        role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      } : null;
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }
};

// User management API
export const userApi = {
  getUsers: async () => {
    await delay(1000);
    return Object.entries(userStore.users).map(([email, user]) => ({
      id: user.id,
      email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount
    }));
  },

  createUser: async (userData: any) => {
    await delay(800);
    const id = String(Object.keys(userStore.users).length + 1);
    const newUser = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      loginCount: 0
    };
    
    userStore.addUser(userData.email, newUser);
    return { ...newUser, email: userData.email };
  },

  updateUser: async (id: string, userData: any) => {
    await delay(800);
    const userEntry = Object.entries(userStore.users).find(([_, user]) => user.id === id);
    if (!userEntry) throw new Error('User not found');

    const [email] = userEntry;
    userStore.updateUser(email, userData);
    
    return { ...userStore.getUser(email), email };
  },

  deleteUser: async (id: string) => {
    await delay(800);
    const userEmail = Object.entries(userStore.users)
      .find(([_, user]) => user.id === id)?.[0];
      
    if (userEmail) {
      userStore.deleteUser(userEmail);
    }
    return { success: true };
  }
};

// Admin API
export const adminApi = {
  getStats: async () => {
    await delay(1000);
    const users = Object.values(userStore.users);
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      recentLogins: [
        { date: '2024-03-15', count: 3 },
        { date: '2024-03-16', count: 5 },
        { date: '2024-03-17', count: 4 },
        { date: '2024-03-18', count: 7 },
        { date: '2024-03-19', count: 6 }
      ]
    };
  }
};

// Interview API with OpenAI integration
export const interviewApi = {
  uploadResume: async (content: string) => {
    await delay(1000);
    const sessionId = `session_${Date.now()}`;
    localStorage.setItem(`resume_${sessionId}`, content);
    
    // Initialize conversation memory
    conversationMemory[sessionId] = {
      messages: [{
        role: 'system',
        content: `You are the candidate in a job interview. Respond based on this resume:\n\n${content}\n\nUse casual Indian English, be conversational, and maintain the persona of the actual candidate. Don't give textbook answers, use examples where possible, and keep responses concise and natural.`
      }],
      context: content,
      lastActive: Date.now()
    };
    
    return {
      session_id: sessionId,
      status: 'success'
    };
  },

  getAnswer: async (question: string, sessionId: string) => {
    await delay(1500);
    
    if (!conversationMemory[sessionId]) {
      throw new Error('Session expired. Please start a new interview.');
    }

    const memory = conversationMemory[sessionId];
    memory.lastActive = Date.now();

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...memory.messages,
          { role: 'user', content: question }
        ],
        temperature: 0.9,
        max_tokens: 350,
        presence_penalty: 0.7,
        frequency_penalty: 0.5
      });

      const answer = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try asking your question differently.';
      
      // Update conversation memory
      memory.messages.push(
        { role: 'user', content: question },
        { role: 'assistant', content: answer }
      );

      // Keep only last 10 messages to prevent context length issues
      if (memory.messages.length > 10) {
        memory.messages = [
          memory.messages[0], // Keep system message
          ...memory.messages.slice(-9) // Keep last 9 messages
        ];
      }

      return {
        response: answer,
        status: 'success'
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  },

  clearConversation: (sessionId: string) => {
    delete conversationMemory[sessionId];
    localStorage.removeItem(`resume_${sessionId}`);
    localStorage.removeItem(`chat_${sessionId}`);
  }
};