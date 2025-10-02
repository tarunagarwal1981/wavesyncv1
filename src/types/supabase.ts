export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          department: string | null;
          position: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          department?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          department?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          due_date: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          due_date?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          due_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tickets_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tickets_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
          created_at: string;
          updated_at: string;
          due_date: string | null;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
          created_at?: string;
          updated_at?: string;
          due_date?: string | null;
          assigned_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
          created_at?: string;
          updated_at?: string;
          due_date?: string | null;
          assigned_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assignments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assignments_assigned_by_fkey';
            columns: ['assigned_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      certificates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          issue_date: string | null;
          expiry_date: string | null;
          status: 'valid' | 'expired' | 'revoked';
          certificate_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          issue_date?: string | null;
          expiry_date?: string | null;
          status?: 'valid' | 'expired' | 'revoked';
          certificate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          issue_date?: string | null;
          expiry_date?: string | null;
          status?: 'valid' | 'expired' | 'revoked';
          certificate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed';
      ticket_priority: 'low' | 'medium' | 'high' | 'urgent';
      assignment_status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
      certificate_status: 'valid' | 'expired' | 'revoked';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

