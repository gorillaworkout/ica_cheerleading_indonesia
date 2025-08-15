import { Scale } from "lucide-react"

interface LevelIndicatorProps {
  certificationLevel: string
  size?: "sm" | "md" | "lg"
  variant?: "badge" | "overlay"
}

export function LevelIndicator({ 
  certificationLevel, 
  size = "md", 
  variant = "badge" 
}: LevelIndicatorProps) {
  // Function to get shortened course name
  const getShortName = (fullName: string): string => {
    if (!fullName) return "N/A"
    
    // Common patterns for shortening course names
    const shortNames: { [key: string]: string } = {
      // Judge courses
      "Level 1 Judge Course": "L1 Judge",
      "Level 2 Judge Course": "L2 Judge", 
      "Level 3 Judge Course": "L3 Judge",
      "Level 4 Judge Course": "L4 Judge",
      "International Judge Course": "INT Judge",
      
      // Coach courses
      "Level 1 Coach Course": "L1 Coach",
      "Level 2 Coach Course": "L2 Coach",
      "Level 3 Coach Course": "L3 Coach", 
      "Level 4 Coach Course": "L4 Coach",
      "International Coach Course": "INT Coach",
      
      // Rules courses
      "Rules Course": "Rules",
      "Advanced Rules Course": "Adv Rules",
      "International Rules Course": "INT Rules",
      
      // Fallback patterns - now include course type info
      // Removed simple level patterns to let enhanced fallback work
    }
    
    // Enhanced fallback with course type detection (run first)
    if (fullName.includes("Level 1")) {
      if (fullName.includes("Judge")) return "L1 Judge"
      if (fullName.includes("Coach")) return "L1 Coach"
      if (fullName.includes("Rules")) return "L1 Rules"
      return "L1"
    } else if (fullName.includes("Level 2")) {
      if (fullName.includes("Judge")) return "L2 Judge"
      if (fullName.includes("Coach")) return "L2 Coach"
      if (fullName.includes("Rules")) return "L2 Rules"
      return "L2"
    } else if (fullName.includes("Level 3")) {
      if (fullName.includes("Judge")) return "L3 Judge"
      if (fullName.includes("Coach")) return "L3 Coach"
      if (fullName.includes("Rules")) return "L3 Rules"
      return "L3"
    } else if (fullName.includes("Level 4")) {
      if (fullName.includes("Judge")) return "L4 Judge"
      if (fullName.includes("Coach")) return "L4 Coach"
      if (fullName.includes("Rules")) return "L4 Rules"
      return "L4"
    } else if (fullName.includes("International")) {
      if (fullName.includes("Judge")) return "INT Judge"
      if (fullName.includes("Coach")) return "INT Coach"
      if (fullName.includes("Rules")) return "INT Rules"
      return "INT"
    }
    
    // Try exact match
    if (shortNames[fullName]) {
      return shortNames[fullName]
    }
    
    // Try pattern matching for other patterns
    for (const [pattern, shortName] of Object.entries(shortNames)) {
      if (fullName.includes(pattern)) {
        return shortName
      }
    }
    
    // If no pattern matches, truncate to reasonable length
    if (fullName.length > 20) {
      return fullName.substring(0, 20) + "..."
    }
    
    return fullName
  }
  
  // Get color scheme based on course level
  const getColorScheme = (level: string) => {
    if (level.includes("International") || level.includes("INT")) {
      return {
        bg: "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700",
        text: "text-white",
        border: "border-purple-200"
      }
    } else if (level.includes("Level 4") || level.includes("L4")) {
      return {
        bg: "bg-gradient-to-r from-red-500 via-red-600 to-red-700", 
        text: "text-white",
        border: "border-red-200"
      }
    } else if (level.includes("Level 3") || level.includes("L3")) {
      return {
        bg: "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700",
        text: "text-white", 
        border: "border-orange-200"
      }
    } else if (level.includes("Level 2") || level.includes("L2")) {
      return {
        bg: "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700",
        text: "text-white",
        border: "border-emerald-200"
      }
    } else if (level.includes("Level 1") || level.includes("L1")) {
      return {
        bg: "bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700",
        text: "text-white",
        border: "border-slate-200"
      }
    } else {
      // Default for other course types
      return {
        bg: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
        text: "text-white",
        border: "border-blue-200"
      }
    }
  }
  
  const shortName = getShortName(certificationLevel)
  const colors = getColorScheme(certificationLevel)
  
  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm", 
    lg: "px-4 py-2 text-base"
  }
  
  if (variant === "overlay") {
    return (
      <div className={`absolute -bottom-2 -right-2 flex items-center space-x-1 ${sizeClasses[size]} rounded-full font-semibold shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200 ${colors.bg} ${colors.text}`}>
        <Scale className="w-3 h-3" />
        <span>{shortName}</span>
      </div>
    )
  }
  
  // Default badge variant
  return (
    <div className={`inline-flex justify-center items-center space-x-1 ${sizeClasses[size]} rounded-full font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
      <Scale className="w-3 h-3" />
      <span>{shortName}</span>
    </div>
  )
} 