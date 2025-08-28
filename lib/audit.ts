import { supabase } from './supabase'

export interface AuditLogData {
  user_id: string
  table_name: string
  record_id: string
  action_type: 'CREATE' | 'UPDATE' | 'DELETE'
  old_data?: any
  new_data?: any
  changed_fields?: string[]
  ip_address?: string | null
  user_agent?: string
  created_by?: string
}

export class AuditService {
  /**
   * Log any database change for audit trail
   */
  static async logChange(data: AuditLogData) {
    try {
      // Validate required fields
      if (!data.user_id || !data.table_name || !data.record_id || !data.action_type) {
        console.warn('Audit log missing required fields:', data)
        return
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: data.user_id,
          table_name: data.table_name,
          record_id: data.record_id,
          action_type: data.action_type,
          old_data: data.old_data,
          new_data: data.new_data,
          changed_fields: data.changed_fields,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          created_by: data.created_by || data.user_id,
        })

      if (error) {
        // Log error but don't throw to prevent breaking the main flow
        console.error('Failed to log audit trail:', error)
        
        // If it's an RLS error, log it specifically
        if (error.code === '42501') {
          console.warn('RLS policy violation for audit_logs table. User may not have proper permissions.')
        }
      }
    } catch (error) {
      console.error('Audit service error:', error)
      // Don't re-throw the error to prevent breaking the main application flow
    }
  }

  /**
   * Compare two objects and return changed fields
   */
  static getChangedFields(oldData: any, newData: any): string[] {
    const changes: string[] = []
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])

    allKeys.forEach(key => {
      const oldValue = oldData?.[key]
      const newValue = newData?.[key]

      // Handle arrays (like certifications, achievements)
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
          changes.push(key)
        }
      } 
      // Handle regular values
      else if (oldValue !== newValue) {
        changes.push(key)
      }
    })

    return changes
  }

  /**
   * Get user's audit history with pagination
   */
  static async getUserAuditHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    tableFilter?: string
  ) {
    try {
      // First, get the count
      let countQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (tableFilter) {
        countQuery = countQuery.eq('table_name', tableFilter)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('Failed to get count:', countError)
        throw countError
      }

      // Then, get the data with pagination
      let dataQuery = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (tableFilter) {
        dataQuery = dataQuery.eq('table_name', tableFilter)
      }

      const { data, error: dataError } = await dataQuery
        .range((page - 1) * limit, page * limit - 1)

      if (dataError) {
        console.error('Failed to get data:', dataError)
        throw dataError
      }

      return { data: data || [], count: count || 0, page, limit }
    } catch (error) {
      console.error('Failed to fetch audit history:', error)
      return { data: [], count: 0, page, limit }
    }
  }

  /**
   * Get readable change description
   */
  static getChangeDescription(log: any): string {
    const { table_name, action_type, changed_fields } = log

    // Fields that should be hidden from user view (private/system fields and non-editable fields)
    const hiddenFields = [
      'email', 'member_code', 'id_card', 'is_deleted', 'age', 'team_id', 'division_id',
      'is_verified', 'is_edit_allowed', 'created_at', 'updated_at', 'id', 'user_id',
      'role', 'email_verified_at', 'phone_verified_at', 'verification_token',
      'reset_token', 'last_login_at', 'login_count', 'status', 'deleted_at'
    ]

    // Filter out hidden fields from changed_fields for display
    const publicChangedFields = changed_fields?.filter((field: string) => !hiddenFields.includes(field)) || []

    switch (action_type) {
      case 'CREATE':
        return `Created ${table_name} profile`
      case 'UPDATE':
        if (publicChangedFields.length > 0) {
          return `Updated ${publicChangedFields.join(', ')} in ${table_name}`
        }
        return `Updated ${table_name} profile`
      case 'DELETE':
        return `Deleted ${table_name} profile`
      default:
        return `Modified ${table_name}`
    }
  }

  /**
   * Get change details for display
   */
  static getChangeDetails(log: any): { field: string, oldValue: any, newValue: any }[] {
    const { old_data, new_data, changed_fields } = log
    const details: { field: string, oldValue: any, newValue: any }[] = []

    // Fields that should be hidden from user view (private/system fields and non-editable fields)
    const hiddenFields = [
      'email', 'member_code', 'id_card', 'is_deleted', 'age', 'team_id', 'division_id',
      'is_verified', 'is_edit_allowed', 'created_at', 'updated_at', 'id', 'user_id',
      'role', 'email_verified_at', 'phone_verified_at', 'verification_token',
      'reset_token', 'last_login_at', 'login_count', 'status', 'deleted_at'
    ]

    if (changed_fields && old_data && new_data) {
      changed_fields.forEach((field: string) => {
        // Skip hidden fields
        if (hiddenFields.includes(field)) {
          return
        }
        
        details.push({
          field,
          oldValue: old_data[field],
          newValue: new_data[field]
        })
      })
    }

    return details
  }
}

/**
 * Get client IP and User Agent for audit logging
 */
export function getClientInfo() {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
  
  // For IP, you'd typically get this from request headers in API route
  return {
    user_agent: userAgent,
    ip_address: null // Will be set in API routes
  }
}
