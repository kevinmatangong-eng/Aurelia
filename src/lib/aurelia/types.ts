export type MemoryCategory =
  | "interest"
  | "goal"
  | "preference"
  | "fact"
  | "project"
  | "book"
  | "subject"
  | "person"
  | "date"
  | "habit"
  | "other";

export const MEMORY_CATEGORIES: MemoryCategory[] = [
  "interest",
  "goal",
  "preference",
  "fact",
  "project",
  "book",
  "subject",
  "person",
  "date",
  "habit",
  "other",
];

export type GoalStatus = "active" | "paused" | "done";
export type GoalCadence = "none" | "daily" | "weekly";
export type ProactiveFrequency = "quiet" | "thoughtful" | "present";
export type ThemeName = "void" | "dawn";
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type ProactivePriority = "low" | "medium" | "high";

export type UserSettings = {
  userId: string;
  notificationsEnabled: boolean;
  proactiveEnabled: boolean;
  proactiveFrequency: ProactiveFrequency;
  maxProactivePerDay: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  allowImportantDuringQuiet: boolean;
  memoryEnabled: boolean;
  personalityIntensity: number;
  notificationSound: boolean;
  theme: ThemeName;
  model: string;
  timezone: string;
  lastActiveAt: string | null;
  lastProactiveAt: string | null;
};

export type Conversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  unread: boolean;
  lastMessage: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  toolName: string | null;
};

export type Memory = {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  cadence: GoalCadence;
  lastProgressAt: string | null;
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  notes: string;
  dueAt: string | null;
  completed: boolean;
  createdAt: string;
};

export type ProactiveEvent = {
  id: string;
  conversationId: string | null;
  priority: ProactivePriority;
  reason: string;
  message: string;
  notificationTitle: string;
  sentAt: string;
  openedAt: string | null;
  ignored: boolean;
};

export type ProactiveDecision = {
  should_contact: boolean;
  priority: ProactivePriority;
  reason: string;
  message: string;
  notification_title: string;
};

export type SendMessageResult = {
  conversationId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage | null;
  error?: string;
};

export type EvaluateProactiveResult = {
  contacted: boolean;
  silentReason?: string;
  event?: ProactiveEvent;
  conversationId?: string;
};
