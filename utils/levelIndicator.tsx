import React from 'react'

interface LevelIndicatorProps {
  level: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'floating' | 'badge' | 'compact'
}

export function LevelIndicator({ level, size = 'md', variant = 'badge' }: LevelIndicatorProps) {
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'International':
        return {
          gradient: 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ),
          shortText: 'INT',
          fullText: 'International Certified'
        }
      case 'Level 4':
        return {
          gradient: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
          badge: 'bg-red-100 text-red-800 border-red-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          ),
          shortText: 'L4',
          fullText: 'Level 4 Certified'
        }
      case 'Level 3':
        return {
          gradient: 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          ),
          shortText: 'L3',
          fullText: 'Level 3 Certified'
        }
      case 'Level 2':
        return {
          gradient: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          ),
          shortText: 'L2',
          fullText: 'Level 2 Certified'
        }
      default: // Level 1
        return {
          gradient: 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          ),
          shortText: 'L1',
          fullText: 'Level 1 Certified'
        }
    }
  }

  const config = getLevelConfig(level)
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3'
        }
      case 'lg':
        return {
          container: 'px-4 py-2 text-sm',
          icon: 'w-4 h-4'
        }
      default: // md
        return {
          container: 'px-3 py-1.5 text-xs',
          icon: 'w-3 h-3'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (variant === 'floating') {
    return (
      <div className={`${config.gradient} text-white flex items-center space-x-1 ${sizeClasses.container} rounded-full font-semibold shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200`}>
        {React.cloneElement(config.icon, { className: sizeClasses.icon })}
        <span>{config.shortText}</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`${config.badge} border inline-flex items-center space-x-1 ${sizeClasses.container} rounded-full font-medium`}>
        {React.cloneElement(config.icon, { className: sizeClasses.icon })}
        <span>{config.shortText}</span>
      </div>
    )
  }

  // Default badge variant
  return (
    <div className={`${config.badge} border inline-flex items-center space-x-1 ${sizeClasses.container} rounded-full font-medium`}>
      {React.cloneElement(config.icon, { className: sizeClasses.icon })}
      <span>{config.fullText}</span>
    </div>
  )
}

// Helper function to get level color for other uses
export function getLevelColor(level: string) {
  switch (level) {
    case 'International':
      return 'purple'
    case 'Level 4':
      return 'red'
    case 'Level 3':
      return 'orange'
    case 'Level 2':
      return 'emerald'
    default:
      return 'slate'
  }
} 