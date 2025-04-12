// Chrome extension messaging types
export interface ExtensionMessage {
  action: string;
  [key: string]: any;
}

export interface ExtensionResponse {
  success: boolean;
  content?: string;
  message?: string;
  data?: any;
}

// Result display configuration
export interface ResultConfig {
  icon: React.ElementType;
  iconClass: string;
  textClass: string;
  barClass: string;
  text: string;
}

// Analysis prediction confidence levels
export enum ConfidenceLevel {
  LOW = "low", // 0-33%
  MEDIUM = "medium", // 34-66%
  HIGH = "high" // 67-100%
}

// Classification result types
export enum ClassificationType {
  RELIABLE = "reliable",
  POTENTIALLY_MISLEADING = "potentially_misleading",
  LIKELY_FALSE = "likely_false"
}

// Criteria evaluation status
export enum CriteriaStatus {
  GOOD = "good",
  WARNING = "warning",
  BAD = "bad"
}

// Fact-checking verdict types
export enum FactCheckVerdict {
  VERIFIED = "verified",
  MISLEADING = "misleading",
  FALSE = "false"
}

// Application settings type
export interface Settings {
  enableAutoAnalysis: boolean;
  showNotifications: boolean;
  analysisThreshold: number;
  theme: "light" | "dark" | "system";
}
