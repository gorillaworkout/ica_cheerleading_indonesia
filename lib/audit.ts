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
        console.error('Failed to log audit trail:', error)
      }
    } catch (error) {
      console.error('Audit service error:', error)
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
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          table_name,
          action_type,
          changed_fields,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (tableFilter) {
        query = query.eq('table_name', tableFilter)
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return { data, count, page, limit }
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

    switch (action_type) {
      case 'CREATE':
        return `Created ${table_name} profile`
      case 'UPDATE':
        if (changed_fields && changed_fields.length > 0) {
          return `Updated ${changed_fields.join(', ')} in ${table_name}`
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

    if (changed_fields && old_data && new_data) {
      changed_fields.forEach((field: string) => {
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
