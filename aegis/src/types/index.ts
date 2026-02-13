// User types
export interface User {
  id: number;
  name: string;
  role: string;
  avatar: string;
  following: boolean;
  achievements: number;
  online: boolean;
}

// Feed types
export interface Post {
  id: number;
  user: string;
  handle: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  type: string;
  image: boolean;
}

// Roadmap types
export interface Roadmap {
  id: number;
  title: string;
  field: string;
  steps: string[];
}

// Quiz types
export interface Quiz {
  id: number;
  title: string;
  difficulty: string;
  active: boolean;
  time: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  university: string;
  field: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// Component Props types
export interface TabProps {
  isDark: boolean;
}

export interface TabPropsWithUser extends TabProps {
  users: User[];
}

export interface TabPropsWithPosts extends TabProps {
  posts: Post[];
}

export interface TabPropsWithRoadmaps extends TabProps {
  roadmaps: Roadmap[];
}

export interface TabPropsWithQuizzes extends TabProps {
  quizzes: Quiz[];
}

// Theme types
export type Theme = 'light' | 'dark';

// Tab types
export type TabType = 'home' | 'feed' | 'network' | 'chat' | 'roadmaps' | 'quiz' | 'profile';
