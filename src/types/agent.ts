export interface ToolDefinition {
  tool: string;
  params: Record<string, any>;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatSession {
  id: string;
  messages: AgentMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
}
