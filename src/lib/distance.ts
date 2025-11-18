/**
 * Distance and proximity helper functions for Phone Buddy
 */

export type RiskLevel = 'safe' | 'warning' | 'danger'

/**
 * Calculate risk level based on RSSI (Received Signal Strength Indicator)
 * Lower RSSI values indicate weaker signal (device is farther away)
 * 
 * Thresholds:
 * - safe: RSSI >= -60 (close, strong signal)
 * - warning: RSSI between -60 and -80 (moderate distance)
 * - danger: RSSI < -80 (far away, weak signal or disconnected)
 */
export function calculateRiskLevel(rssi: number): RiskLevel {
  if (rssi >= -60) {
    return 'safe'
  } else if (rssi >= -80) {
    return 'warning'
  } else {
    return 'danger'
  }
}

/**
 * Determine if an alert should be triggered based on risk level changes
 * Returns true when transitioning from a safer level to a more dangerous level
 * 
 * Level hierarchy: safe < warning < danger
 */
export function shouldTriggerAlert(
  previousLevel: RiskLevel | null,
  currentLevel: RiskLevel
): boolean {
  // No previous level means this is the first reading - don't alert
  if (previousLevel === null) {
    return false
  }

  // If levels are the same, no alert needed
  if (previousLevel === currentLevel) {
    return false
  }

  // Define level severity
  const levelSeverity: Record<RiskLevel, number> = {
    safe: 1,
    warning: 2,
    danger: 3,
  }

  // Only trigger if moving to a more dangerous level
  return levelSeverity[currentLevel] > levelSeverity[previousLevel]
}


