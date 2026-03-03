export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          ai_prompt: string | null
          ai_response: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          ai_prompt?: string | null
          ai_response?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          ai_prompt?: string | null
          ai_response?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      ai_workflow_suggestions: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          organization_id: string | null
          status: string | null
          suggestion: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          suggestion?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          suggestion?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          organization_id: string | null
          previous_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          organization_id?: string | null
          previous_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          organization_id?: string | null
          previous_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_name: string
          job_type: string
          organization_id: string | null
          payload: Json | null
          run_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_name: string
          job_type: string
          organization_id?: string | null
          payload?: Json | null
          run_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_name?: string
          job_type?: string
          organization_id?: string | null
          payload?: Json | null
          run_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      call_dispositions: {
        Row: {
          agent_id: string
          attempt_count_at_time: number | null
          created_at: string | null
          disposition_type: string
          id: string
          lead_id: string
          notes: string | null
          organization_id: string | null
        }
        Insert: {
          agent_id: string
          attempt_count_at_time?: number | null
          created_at?: string | null
          disposition_type: string
          id?: string
          lead_id: string
          notes?: string | null
          organization_id?: string | null
        }
        Update: {
          agent_id?: string
          attempt_count_at_time?: number | null
          created_at?: string | null
          disposition_type?: string
          id?: string
          lead_id?: string
          notes?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_dispositions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      case_document_checklist: {
        Row: {
          case_id: string
          created_at: string | null
          document_name: string
          id: string
          received: boolean | null
          required: boolean | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          document_name: string
          id?: string
          received?: boolean | null
          required?: boolean | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          document_name?: string
          id?: string
          received?: boolean | null
          required?: boolean | null
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          case_id: string | null
          created_at: string | null
          document_name: string | null
          document_type: string | null
          file_name: string
          file_path: string
          id: string
          is_required: boolean | null
          organization_id: string
          owner_role: string | null
          owner_type: string | null
          required_document_id: string | null
          status: string | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          document_name?: string | null
          document_type?: string | null
          file_name: string
          file_path: string
          id?: string
          is_required?: boolean | null
          organization_id: string
          owner_role?: string | null
          owner_type?: string | null
          required_document_id?: string | null
          status?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          document_name?: string | null
          document_type?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_required?: boolean | null
          organization_id?: string
          owner_role?: string | null
          owner_type?: string | null
          required_document_id?: string | null
          status?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_required_document_id_fkey"
            columns: ["required_document_id"]
            isOneToOne: false
            referencedRelation: "missing_documents"
            referencedColumns: ["required_document_id"]
          },
          {
            foreignKeyName: "case_documents_required_document_id_fkey"
            columns: ["required_document_id"]
            isOneToOne: false
            referencedRelation: "required_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      case_stage_history: {
        Row: {
          case_id: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_stage: string | null
          previous_stage: string | null
        }
        Insert: {
          case_id: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_stage?: string | null
          previous_stage?: string | null
        }
        Update: {
          case_id?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_stage?: string | null
          previous_stage?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          created_at: string | null
          current_stage: string | null
          id: string
          lead_id: string | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stage?: string | null
          id?: string
          lead_id?: string | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stage?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      client_intake: {
        Row: {
          address: string | null
          business_income: number | null
          case_id: string | null
          city: string | null
          created_at: string | null
          created_by: string | null
          dependents: number | null
          dob: string | null
          email: string | null
          estimated_refund: number | null
          filing_status: string | null
          form_1099_income: number | null
          full_legal_name: string
          id: string
          lead_id: string | null
          notes: string | null
          organization_id: string | null
          other_income: number | null
          phone: string | null
          ssn_encrypted: string | null
          ssn_last_four: string | null
          state: string | null
          updated_at: string | null
          w2_income: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_income?: number | null
          case_id?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          dependents?: number | null
          dob?: string | null
          email?: string | null
          estimated_refund?: number | null
          filing_status?: string | null
          form_1099_income?: number | null
          full_legal_name: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          other_income?: number | null
          phone?: string | null
          ssn_encrypted?: string | null
          ssn_last_four?: string | null
          state?: string | null
          updated_at?: string | null
          w2_income?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_income?: number | null
          case_id?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          dependents?: number | null
          dob?: string | null
          email?: string | null
          estimated_refund?: number | null
          filing_status?: string | null
          form_1099_income?: number | null
          full_legal_name?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          other_income?: number | null
          phone?: string | null
          ssn_encrypted?: string | null
          ssn_last_four?: string | null
          state?: string | null
          updated_at?: string | null
          w2_income?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_intake_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_pipeline_aging"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "client_intake_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_intake_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      estimations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          case_id: string | null
          created_at: string | null
          created_by: string | null
          estimated_completion_days: number | null
          estimated_fee_usd: number
          id: string
          intake_id: string | null
          notes: string | null
          organization_id: string | null
          rejected_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_completion_days?: number | null
          estimated_fee_usd: number
          id?: string
          intake_id?: string | null
          notes?: string | null
          organization_id?: string | null
          rejected_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_completion_days?: number | null
          estimated_fee_usd?: number
          id?: string
          intake_id?: string | null
          notes?: string | null
          organization_id?: string | null
          rejected_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_pipeline_aging"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "estimations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimations_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "client_intake"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          agent_id: string
          created_at: string | null
          follow_up_datetime: string
          id: string
          lead_id: string
          notes: string | null
          organization_id: string
          status: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          follow_up_datetime: string
          id?: string
          lead_id: string
          notes?: string | null
          organization_id: string
          status?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          follow_up_datetime?: string
          id?: string
          lead_id?: string
          notes?: string | null
          organization_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      followups_import: {
        Row: {
          agent_id: string | null
          created_at: string | null
          follow_up_datetime: string | null
          id: string
          lead_id: string | null
          notes: string | null
          organization_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          follow_up_datetime?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          follow_up_datetime?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
        }
        Relationships: []
      }
      lead_assignment_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          lead_id: string
          new_agent_id: string | null
          previous_agent_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          new_agent_id?: string | null
          previous_agent_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          new_agent_id?: string | null
          previous_agent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignment_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          attempt_count: number | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          lead_score: number | null
          lead_source: string | null
          next_retry_date: string | null
          organization_id: string
          phone_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          attempt_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          lead_score?: number | null
          lead_source?: string | null
          next_retry_date?: string | null
          organization_id: string
          phone_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          attempt_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lead_score?: number | null
          lead_source?: string | null
          next_retry_date?: string | null
          organization_id?: string
          phone_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          department_id: string | null
          full_name: string
          id: string
          organization_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          full_name: string
          id: string
          organization_id?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          full_name?: string
          id?: string
          organization_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          case_id: string | null
          created_at: string | null
          document_name: string
          id: string
          is_required: boolean | null
          organization_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          document_name: string
          id?: string
          is_required?: boolean | null
          organization_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          document_name?: string
          id?: string
          is_required?: boolean | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_pipeline_aging"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "required_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_entries: {
        Row: {
          agent_id: string | null
          amount_usd: number
          case_id: string | null
          created_at: string | null
          id: string
          locked: boolean | null
          organization_id: string
          payment_date: string | null
          payment_method: string | null
        }
        Insert: {
          agent_id?: string | null
          amount_usd: number
          case_id?: string | null
          created_at?: string | null
          id?: string
          locked?: boolean | null
          organization_id: string
          payment_date?: string | null
          payment_method?: string | null
        }
        Update: {
          agent_id?: string | null
          amount_usd?: number
          case_id?: string | null
          created_at?: string | null
          id?: string
          locked?: boolean | null
          organization_id?: string
          payment_date?: string | null
          payment_method?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          leaderboard_reset_day: number | null
          max_attempt_limit: number | null
          organization_id: string
          retry_gap_days: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leaderboard_reset_day?: number | null
          max_attempt_limit?: number | null
          organization_id: string
          retry_gap_days?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leaderboard_reset_day?: number | null
          max_attempt_limit?: number | null
          organization_id?: string
          retry_gap_days?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      agent_leaderboard: {
        Row: {
          agent_id: string | null
          total_payments: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      agent_productivity: {
        Row: {
          agent_id: string | null
          full_name: string | null
          total_calls: number | null
          total_followups: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      call_analytics_daily: {
        Row: {
          agent_id: string | null
          call_date: string | null
          total_calls: number | null
        }
        Relationships: []
      }
      case_lifecycle_analytics: {
        Row: {
          current_stage: string | null
          total_cases: number | null
        }
        Relationships: []
      }
      case_pipeline_aging: {
        Row: {
          age_days: number | null
          age_interval: unknown
          case_id: string | null
          created_at: string | null
          current_stage: string | null
        }
        Insert: {
          age_days?: never
          age_interval?: never
          case_id?: string | null
          created_at?: string | null
          current_stage?: string | null
        }
        Update: {
          age_days?: never
          age_interval?: never
          case_id?: string | null
          created_at?: string | null
          current_stage?: string | null
        }
        Relationships: []
      }
      conversion_performance: {
        Row: {
          agent_id: string | null
          conversion_rate: number | null
          total_conversions: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      followups_priority: {
        Row: {
          agent_id: string | null
          created_at: string | null
          follow_up_datetime: string | null
          id: string | null
          lead_id: string | null
          notes: string | null
          organization_id: string | null
          priority_rank: number | null
          status: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          follow_up_datetime?: string | null
          id?: string | null
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          priority_rank?: never
          status?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          follow_up_datetime?: string | null
          id?: string | null
          lead_id?: string | null
          notes?: string | null
          organization_id?: string | null
          priority_rank?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_analytics: {
        Row: {
          total_cases: number | null
          total_leads: number | null
          total_revenue_entries: number | null
        }
        Relationships: []
      }
      leaderboard_metrics: {
        Row: {
          agent_id: string | null
          monthly_revenue: number | null
          yearly_revenue: number | null
        }
        Relationships: []
      }
      missing_documents: {
        Row: {
          case_id: string | null
          document_name: string | null
          required_document_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_pipeline_aging"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "required_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_documents_view: {
        Row: {
          case_id: string | null
          missing_count: number | null
        }
        Relationships: []
      }
      pipeline_bottlenecks: {
        Row: {
          avg_days_in_stage: number | null
          current_stage: string | null
          total_cases: number | null
        }
        Relationships: []
      }
      revenue_pipeline_view: {
        Row: {
          amount_usd: number | null
          current_stage: string | null
          id: string | null
          payment_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_org: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      mark_overdue_followups: { Args: never; Returns: undefined }
      process_followups_import: { Args: never; Returns: undefined }
      refresh_leaderboard: { Args: never; Returns: undefined }
      rotate_not_answered_leads: {
        Args: never
        Returns: {
          action: string
          lead_id: string
          lead_name: string
          new_agent: string
          prev_agent: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
