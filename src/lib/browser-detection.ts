/**
 * Browser detection utilities
 * Helps identify Safari and provide appropriate fallbacks
 */

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isSafariUA = userAgent.includes('safari') && !userAgent.includes('chrome')
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  
  return isSafariUA || isIOS
}

export function isChrome(): boolean {
  if (typeof window === 'undefined') return false
  return /chrome/.test(window.navigator.userAgent.toLowerCase()) && !/edg/.test(window.navigator.userAgent.toLowerCase())
}

export function isEdge(): boolean {
  if (typeof window === 'undefined') return false
  return /edg/.test(window.navigator.userAgent.toLowerCase())
}

export function supportsWebBluetooth(): boolean {
  if (typeof window === 'undefined') return false
  return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth
}

export function getBrowserInfo(): {
  name: string
  supportsBluetooth: boolean
  isMobile: boolean
} {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      supportsBluetooth: false,
      isMobile: false,
    }
  }

  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    window.navigator.userAgent
  )

  let browserName = 'unknown'
  if (isSafari()) {
    browserName = 'safari'
  } else if (isChrome()) {
    browserName = 'chrome'
  } else if (isEdge()) {
    browserName = 'edge'
  } else if (/firefox/i.test(window.navigator.userAgent)) {
    browserName = 'firefox'
  }

  return {
    name: browserName,
    supportsBluetooth: supportsWebBluetooth(),
    isMobile,
  }
}

