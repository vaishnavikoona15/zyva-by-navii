export type ChatResponse = {
  agent: string;
  reasoning: string;
  response: string;
  data: Record<string, unknown>;
};

export type BudgetAllocation = {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
};

export type BudgetBreakdown = {
  allocation: BudgetAllocation;
  tips: string[];
  warnings: string[];
  alternatives: string[];
};

export type TravelActivity = {
  time: string;
  title: string;
  description: string;
  estimated_cost: number;
};

export type DayPlan = {
  day: number;
  theme: string;
  meals: string[];
  activities: TravelActivity[];
  local_tip: string;
  estimated_cost: number;
};

export type TravelPlanResponse = {
  budget_breakdown: BudgetBreakdown;
  itinerary: DayPlan[];
};

export type PreferenceItem = {
  key: string;
  value: unknown;
  confidence: number;
};

export type LifestyleAskResponse = {
  recommendation: string;
  preferences_used: PreferenceItem[];
  new_preferences_learned: PreferenceItem[];
};

export type BuyingResearch = {
  category: string;
  budget: string;
  requirements: string[];
  market_insights: string[];
};

export type BuyingRecommendation = {
  product: string;
  price: string;
  why_you: string;
  pros: string[];
  cons: string[];
  verdict: string;
};

export type WebSource = {
  title: string;
  link: string;
  snippet: string;
};

export type BuyingRecommendResponse = {
  research: BuyingResearch;
  recommendation: BuyingRecommendation;
  sources: WebSource[];
  results_analyzed: number;
};

export type RecentInteraction = {
  agent: string;
  content: string;
  created_at: string;
};

export type MemoryRecallResponse = {
  summary: string;
  preferences_by_agent: Record<string, Record<string, unknown>>;
  preference_confidence: Record<string, Record<string, number>>;
  interaction_count: number;
  confidence_snapshot: Record<string, number>;
  recent_interactions: RecentInteraction[];
};
