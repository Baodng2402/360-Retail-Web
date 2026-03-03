export interface LoyaltyRule {
  id: string;
  name: string;
  type: number;
  earningRate: number;
  minSpend: number;
  status: number;
  createdAt?: string;
}

export interface CreateLoyaltyRuleDto {
  name: string;
  type: number;
  earningRate: number;
  minSpend: number;
  status: number;
}

export interface UpdateLoyaltyRuleDto extends CreateLoyaltyRuleDto {}

export interface LoyaltySummary {
  customerId: string;
  customerName: string;
  totalPoints: number;
  rank: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId?: string;
  points: number;
  description?: string;
  type?: string;
  createdAt: string;
}

