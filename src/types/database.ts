/**
 * Hand-maintained, typed mirror of the Supabase schema in
 * `supabase/migrations/202609160001_initial_schema.sql`.
 *
 * Structured to match the shape Supabase's code generation emits so it can
 * later be replaced by `supabase gen types` output with minimal churn.
 * It is deliberately separate from the domain types in `src/types/index.ts`;
 * the domain <-> database mapping is documented in `docs/phase-5-step-1.md`.
 *
 * Keep this file in sync with the migration whenever the schema changes.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RaceStatus = "draft" | "lobby" | "qualifying" | "grid" | "racing" | "completed" | "cancelled";
export type RaceFormat = "sprint" | "feature" | "custom";
export type RaceDriverStatus = "invited" | "confirmed" | "declined" | "ready" | "racing" | "finished" | "dnf" | "dns" | "retired" | "withdrawn";
export type QualifyingStatus = "not_started" | "running" | "completed" | "invalid" | "manually_corrected";
export type RacePenaltyStatus = "issued" | "under_review" | "cancelled";
export type RaceEventType =
  | "qualifying_start"
  | "qualifying_stop"
  | "qualifying_invalid"
  | "qualifying_restore"
  | "qualifying_reset"
  | "qualifying_corrected"
  | "qualifying_replace"
  | "qualifying_promoted"
  | "ready"
  | "not_ready"
  | "race_start"
  | "race_finish"
  | "dnf"
  | "dns"
  | "retired"
  | "withdrawn"
  | "penalty"
  | "penalty_cancelled"
  | "grid_change"
  | "grid_penalty"
  | "complete"
  | "note"
  | "status_change";
export type SeasonStatus = "draft" | "active" | "completed" | "archived";
export type ScoringMode = "automatic" | "custom";
export type AwardType =
  | "winner"
  | "podium"
  | "pole"
  | "driver_of_race"
  | "most_improved"
  | "cleanest_driver"
  | "championship_winner"
  | "team_champion"
  | "most_wins"
  | "most_poles"
  | "most_podiums"
  | "cleanest_season"
  | "participation";
export type GroupRole = "admin" | "organizer" | "member";
export type GroupPrivacy = "private";
export type DriverAvailability = "available" | "maybe" | "not-available";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          id: string;
          profile_id: string;
          nickname: string | null;
          racing_number: number | null;
          avatar_color: string;
          avatar_text_color: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          nickname?: string | null;
          racing_number?: number | null;
          avatar_color?: string;
          avatar_text_color?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          nickname?: string | null;
          racing_number?: number | null;
          avatar_color?: string;
          avatar_text_color?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string;
          logo_initials: string;
          logo_color: string;
          logo_text_color: string;
          cover_color: string;
          privacy: GroupPrivacy;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          logo_initials?: string;
          logo_color?: string;
          logo_text_color?: string;
          cover_color?: string;
          privacy?: GroupPrivacy;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          logo_initials?: string;
          logo_color?: string;
          logo_text_color?: string;
          cover_color?: string;
          privacy?: GroupPrivacy;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          group_id: string;
          driver_id: string;
          role: GroupRole;
          availability: DriverAvailability;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          driver_id: string;
          role?: GroupRole;
          availability?: DriverAvailability;
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          driver_id?: string;
          role?: GroupRole;
          availability?: DriverAvailability;
          joined_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          logo_initials: string;
          logo_color: string;
          logo_text_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          logo_initials?: string;
          logo_color?: string;
          logo_text_color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          logo_initials?: string;
          logo_color?: string;
          logo_text_color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          team_id: string;
          driver_id: string;
          joined_at: string;
        };
        Insert: {
          team_id: string;
          driver_id: string;
          joined_at?: string;
        };
        Update: {
          team_id?: string;
          driver_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      races: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          venue_name: string;
          date: string;
          start_time: string;
          format: RaceFormat;
          status: RaceStatus;
          organizer_id: string;
          qualifying_lap_count: number;
          rules: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          venue_name: string;
          date: string;
          start_time: string;
          format?: RaceFormat;
          status?: RaceStatus;
          organizer_id: string;
          qualifying_lap_count?: number;
          rules?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          venue_name?: string;
          date?: string;
          start_time?: string;
          format?: RaceFormat;
          status?: RaceStatus;
          organizer_id?: string;
          qualifying_lap_count?: number;
          rules?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      race_entries: {
        Row: {
          race_id: string;
          driver_id: string;
          kart_number: number;
          status: RaceDriverStatus;
          confirmed: boolean;
          ready: boolean;
          grid_position: number | null;
          grid_penalty_seconds: number;
          qualifying_time_ms: number | null;
          qualifying_status: QualifyingStatus;
          finish_position: number | null;
          penalty_total_seconds: number;
          notes: string;
        };
        Insert: {
          race_id: string;
          driver_id: string;
          kart_number: number;
          status?: RaceDriverStatus;
          confirmed?: boolean;
          ready?: boolean;
          grid_position?: number | null;
          grid_penalty_seconds?: number;
          qualifying_time_ms?: number | null;
          qualifying_status?: QualifyingStatus;
          finish_position?: number | null;
          penalty_total_seconds?: number;
          notes?: string;
        };
        Update: {
          race_id?: string;
          driver_id?: string;
          kart_number?: number;
          status?: RaceDriverStatus;
          confirmed?: boolean;
          ready?: boolean;
          grid_position?: number | null;
          grid_penalty_seconds?: number;
          qualifying_time_ms?: number | null;
          qualifying_status?: QualifyingStatus;
          finish_position?: number | null;
          penalty_total_seconds?: number;
          notes?: string;
        };
        Relationships: [];
      };
      qualifying_attempts: {
        Row: {
          id: string;
          race_id: string;
          driver_id: string;
          attempt_number: number;
          time_ms: number | null;
          status: QualifyingStatus;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          race_id: string;
          driver_id: string;
          attempt_number?: number;
          time_ms?: number | null;
          status?: QualifyingStatus;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          race_id?: string;
          driver_id?: string;
          attempt_number?: number;
          time_ms?: number | null;
          status?: QualifyingStatus;
          recorded_at?: string;
        };
        Relationships: [];
      };
      race_penalties: {
        Row: {
          id: string;
          race_id: string;
          driver_id: string;
          seconds: number;
          reason: string;
          issued_by: string;
          status: RacePenaltyStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          race_id: string;
          driver_id: string;
          seconds?: number;
          reason?: string;
          issued_by: string;
          status?: RacePenaltyStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          race_id?: string;
          driver_id?: string;
          seconds?: number;
          reason?: string;
          issued_by?: string;
          status?: RacePenaltyStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      race_events: {
        Row: {
          id: string;
          race_id: string;
          driver_id: string | null;
          type: RaceEventType;
          occurred_at: string;
          payload: Json;
        };
        Insert: {
          id?: string;
          race_id: string;
          driver_id?: string | null;
          type: RaceEventType;
          occurred_at?: string;
          payload?: Json;
        };
        Update: {
          id?: string;
          race_id?: string;
          driver_id?: string | null;
          type?: RaceEventType;
          occurred_at?: string;
          payload?: Json;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          status: SeasonStatus;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          status?: SeasonStatus;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          status?: SeasonStatus;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      season_races: {
        Row: {
          season_id: string;
          race_id: string;
          round_number: number;
        };
        Insert: {
          season_id: string;
          race_id: string;
          round_number: number;
        };
        Update: {
          season_id?: string;
          race_id?: string;
          round_number?: number;
        };
        Relationships: [];
      };
      season_scoring: {
        Row: {
          season_id: string;
          mode: ScoringMode;
          pole_position_points: number;
          fastest_lap_points: number;
          participation_points: number;
          dnf_points: number;
          dns_points: number;
          penalty_adjustment_enabled: boolean;
          created_at: string;
        };
        Insert: {
          season_id: string;
          mode?: ScoringMode;
          pole_position_points?: number;
          fastest_lap_points?: number;
          participation_points?: number;
          dnf_points?: number;
          dns_points?: number;
          penalty_adjustment_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          season_id?: string;
          mode?: ScoringMode;
          pole_position_points?: number;
          fastest_lap_points?: number;
          participation_points?: number;
          dnf_points?: number;
          dns_points?: number;
          penalty_adjustment_enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      scoring_points: {
        Row: {
          id: string;
          season_id: string;
          position: number;
          points: number;
        };
        Insert: {
          id?: string;
          season_id: string;
          position: number;
          points: number;
        };
        Update: {
          id?: string;
          season_id?: string;
          position?: number;
          points?: number;
        };
        Relationships: [];
      };
      awards: {
        Row: {
          id: string;
          season_id: string;
          type: AwardType;
          label: string;
          description: string;
          driver_id: string | null;
          team_id: string | null;
          race_id: string | null;
          value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          type: AwardType;
          label: string;
          description?: string;
          driver_id?: string | null;
          team_id?: string | null;
          race_id?: string | null;
          value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          type?: AwardType;
          label?: string;
          description?: string;
          driver_id?: string | null;
          team_id?: string | null;
          race_id?: string | null;
          value?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      race_awards: {
        Row: {
          race_id: string;
          driver_of_race_id: string | null;
          most_improved_id: string | null;
          cleanest_driver_id: string | null;
          updated_at: string;
        };
        Insert: {
          race_id: string;
          driver_of_race_id?: string | null;
          most_improved_id?: string | null;
          cleanest_driver_id?: string | null;
          updated_at?: string;
        };
        Update: {
          race_id?: string;
          driver_of_race_id?: string | null;
          most_improved_id?: string | null;
          cleanest_driver_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      season_records: {
        Row: {
          id: string;
          season_id: string;
          label: string;
          value: string;
          driver_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          label: string;
          value: string;
          driver_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          label?: string;
          value?: string;
          driver_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}