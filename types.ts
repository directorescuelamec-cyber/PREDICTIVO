export enum Role {
  STUDENT = 'ESTUDIANTE',
  TEACHER = 'DOCENTE_JEFE',
  COUNSELOR = 'ENCARGADO_CONVIVENCIA', // Directivo/Orientador
}

export enum Sentiment {
  POSITIVE = 1,
  NEUTRAL = 0,
  NEGATIVE = -1,
}

export interface Student {
  id: string;
  name: string;
  grade: string; // "5ºA", "6ºB", etc.
  avatar?: string;
}

export interface SurveyResponse {
  studentId: string;
  timestamp: number;
  // Relational Choices
  preferredPeers: string[]; // Who they want to be with (Positive Edge)
  uncomfortablePeers: string[]; // Who they avoid (Negative Edge/Tension)
  perceivedIsolated: string[]; // Who they think is alone (Perception)
  
  // School Climate (Likert 1-5)
  climateRating: number;
  safetyRating: number;
  belongingRating: number;
  
  // Open text
  comments: string;
}

export interface GraphNode extends Student {
  inDegree: number; // Popularity
  outDegree: number; // Sociability
  conflictScore: number; // Received negative links
  riskScore: number; // Calculated probability of conflict/isolation
  clusterId: number; // Community detection ID
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'PERCEIVED_ISOLATION';
  weight: number;
}

export interface RiskAnalysis {
  globalRisk: number; // 0-100
  atRiskStudents: GraphNode[];
  isolatedStudents: GraphNode[];
  tensionGroups: string[][]; // Groups of IDs with mutual negative edges
  recommendations: string; // AI Generated
}
