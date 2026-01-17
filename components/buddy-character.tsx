/**
 * Buddy Character Component
 * A phone with a face - your friendly device tracker!
 */
"use client"

export function BuddyCharacter({ size = "normal" }: { size?: "small" | "normal" | "large" }) {
  // Container sizes
  const sizeClasses = {
    small: "w-12 h-12",
    normal: "w-20 h-20",
    large: "w-32 h-32",
  }

  // Phone sizes - proportional to container
  const phoneSizes = {
    small: "text-2xl",
    normal: "text-4xl",
    large: "text-7xl",
  }

  // Face sizes - positioned on phone screen
  const faceSizes = {
    small: "text-xs",
    normal: "text-sm",
    large: "text-2xl",
  }

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Phone body with face */}
      <div className={`${phoneSizes[size]} relative z-10`}>
        📱
        {/* Face overlay on phone screen - centered */}
        <div className={`
          absolute inset-0 flex items-center justify-center z-20 pointer-events-none
          ${size === "small" ? "mt-[-2px]" : size === "normal" ? "mt-[-4px]" : "mt-[-8px]"}
        `}>
          <span className={faceSizes[size]}>😊</span>
        </div>
      </div>
    </div>
  )
}
