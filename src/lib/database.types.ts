export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      core_members: {
        Row: {
          id: string
          user_id: string
          name: string
          role: 'super_admin' | 'core' | 'volunteer'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          role?: 'super_admin' | 'core' | 'volunteer'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          role?: 'super_admin' | 'core' | 'volunteer'
          is_active?: boolean
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          venue: string | null
          event_date: string
          registration_deadline: string | null
          capacity: number | null
          is_published: boolean
          custom_fields: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          venue?: string | null
          event_date: string
          registration_deadline?: string | null
          capacity?: number | null
          is_published?: boolean
          custom_fields?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          venue?: string | null
          event_date?: string
          registration_deadline?: string | null
          capacity?: number | null
          is_published?: boolean
          custom_fields?: Json
          created_by?: string | null
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          college: string | null
          branch: string | null
          year: number | null
          division: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          college?: string | null
          branch?: string | null
          year?: number | null
          division?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          college?: string | null
          branch?: string | null
          year?: number | null
          division?: string | null
        }
      }
      registrations: {
        Row: {
          id: string
          student_id: string
          event_id: string
          registration_no: string
          qr_token: string
          custom_field_data: Json
          registered_by: string | null
          is_waitlisted: boolean
          registered_at: string
        }
        Insert: {
          id?: string
          student_id: string
          event_id: string
          registration_no: string
          qr_token?: string
          custom_field_data?: Json
          registered_by?: string | null
          is_waitlisted?: boolean
          registered_at?: string
        }
        Update: {
          id?: string
          is_waitlisted?: boolean
          custom_field_data?: Json
        }
      }
      attendance: {
        Row: {
          id: string
          registration_id: string
          scanned_by: string
          scanned_at: string
          notes: string | null
          day1_attended: boolean | null
          day1_attended_at: string | null
          day2_attended: boolean | null
          day2_attended_at: string | null
        }
        Insert: {
          id?: string
          registration_id: string
          scanned_by: string
          scanned_at?: string
          notes?: string | null
          day1_attended?: boolean | null
          day1_attended_at?: string | null
          day2_attended?: boolean | null
          day2_attended_at?: string | null
        }
        Update: {
          notes?: string | null
          day1_attended?: boolean | null
          day1_attended_at?: string | null
          day2_attended?: boolean | null
          day2_attended_at?: string | null
        }
      }
      admin_logs: {
        Row: {
          id: number
          actor_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: never
        Update: never
      }
      waitlist: {
        Row: {
          id: string
          student_id: string
          event_id: string
          joined_at: string
          notified_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          event_id: string
          joined_at?: string
          notified_at?: string | null
        }
        Update: {
          notified_at?: string | null
        }
      }
    }
    Views: {
      registration_details: {
        Row: {
          id: string
          registration_no: string
          registered_at: string
          is_waitlisted: boolean
          custom_field_data: Json
          student_id: string
          student_name: string
          student_email: string
          student_phone: string | null
          student_college: string | null
          student_branch: string | null
          student_year: number | null
          student_prn: string | null
          student_division: string | null
          newsletter_opt_in: boolean
          event_id: string
          event_title: string
          event_date: string
          venue: string | null
          registered_by_name: string | null
        }
      }
      attendance_details: {
        Row: {
          id: string
          scanned_at: string
          notes: string | null
          registration_no: string
          registered_by: string | null
          student_name: string
          student_email: string
          student_college: string | null
          student_branch: string | null
          student_year: number | null
          student_prn: string | null
          student_division: string | null
          event_id: string
          event_title: string
          scanned_by_name: string
        }
      }
    }
    Functions: {
      generate_registration_no: {
        Args: { p_event_id: string }
        Returns: string
      }
      current_member: {
        Args: Record<string, never>
        Returns: Database['public']['Tables']['core_members']['Row']
      }
    }
    Enums: {
      member_role: 'super_admin' | 'core' | 'volunteer'
    }
  }
}
