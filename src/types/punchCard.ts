export interface PunchCardConfig {
  bronze_threshold: number;
  silver_threshold: number;
  gold_threshold: number;
  time_interval: number;
}

export interface PunchCardRecord {
  user_address: string;
  punch_count: number;
  last_punch_time: number;
  bronze_rewarded: boolean;
  silver_rewarded: boolean;
  gold_rewarded: boolean;
}

export interface PunchCardLeaderboard {
  user_address: string;
  punch_count: number;
  rank: number;
}

export interface PunchCardState {
  config: PunchCardConfig;
  user_record: PunchCardRecord | null;
  leaderboard: PunchCardLeaderboard[];
  can_punch: boolean;
  next_punch_time: number;
} 