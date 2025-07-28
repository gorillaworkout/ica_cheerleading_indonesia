import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { 
  fetchProvinces, 
  selectProvinces, 
  selectProvincesLoading, 
  selectProvincesError,
  selectProvincesNeedRefresh 
} from '@/features/provinces/provincesSlice'

/**
 * Smart hook for provinces data - handles caching and prevents duplicate fetches
 * Use this instead of calling fetchProvinces directly in components
 */
export function useProvinces() {
  const dispatch = useAppDispatch()
  
  const provinces = useAppSelector(selectProvinces)
  const loading = useAppSelector(selectProvincesLoading)
  const error = useAppSelector(selectProvincesError)
  const needsRefresh = useAppSelector(selectProvincesNeedRefresh)

  // Smart fetch - only when needed
  const fetchProvincesIfNeeded = useCallback(() => {
    if (needsRefresh && !loading) {
      dispatch(fetchProvinces())
    }
  }, [needsRefresh, loading, dispatch])

  // Auto fetch on mount if needed
  useEffect(() => {
    fetchProvincesIfNeeded()
  }, [fetchProvincesIfNeeded])

  return {
    provinces,
    loading,
    error,
    needsRefresh,
    refetch: fetchProvincesIfNeeded,
    // Helper functions
    isEmpty: provinces.length === 0,
    hasData: provinces.length > 0,
    isReady: !loading && provinces.length > 0
  }
}

/**
 * Hook for getting a single province by ID
 */
export function useProvince(provinceId: string) {
  const { provinces, loading, error } = useProvinces()
  
  const province = provinces.find(p => p.id_province === provinceId)
  
  return {
    province,
    loading,
    error,
    name: province?.name || provinceId,
    exists: !!province
  }
}

/**
 * Hook for province options (for dropdowns/selects)
 */
export function useProvinceOptions() {
  const { provinces, loading, error } = useProvinces()
  
  const options = provinces.map(province => ({
    value: province.id_province,
    label: province.name
  }))
  
  return {
    options,
    loading,
    error,
    isEmpty: options.length === 0
  }
}
