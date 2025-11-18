"use client"

interface SignalStrengthIndicatorProps {
  rssi: number
}

export default function SignalStrengthIndicator({ rssi }: SignalStrengthIndicatorProps) {
  // RSSI ranges: -30 to -90 dBm (typical for Bluetooth)
  // -30 to -40: Excellent
  // -40 to -60: Good
  // -60 to -80: Fair
  // -80 to -90: Weak
  // Below -90: Poor/Out of range

  const getStrength = (rssi: number) => {
    if (rssi >= -40) return 4
    if (rssi >= -60) return 3
    if (rssi >= -80) return 2
    return 1
  }

  const strength = getStrength(rssi)
  const bars = [1, 2, 3, 4]

  return (
    <div className="flex gap-1">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`flex-1 h-8 rounded-sm transition-colors ${bar <= strength ? "bg-accent" : "bg-secondary/50"}`}
        />
      ))}
    </div>
  )
}
