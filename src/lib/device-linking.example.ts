/**
 * Example: How to link a Bluetooth-scanned device to the logged-in user
 * 
 * This shows how to use linkBluetoothDevice in your components/pages
 */

import { linkBluetoothDevice } from './device-linking'
import type { Device } from '@/src/types/device'

// Example usage in a component:
export async function linkDeviceExample(
  userId: string, // From useAuth().user.id
  bluetoothId: string, // From Bluetooth scan
  deviceName?: string,
  icon?: string | null
): Promise<Device> {
  try {
    const device = await linkBluetoothDevice(userId, bluetoothId, deviceName, icon)
    console.log('Device linked successfully:', device)
    return device
  } catch (error) {
    console.error('Failed to link device:', error)
    throw error
  }
}

// Example in a React component:
/*
import { useAuth } from '@/src/hooks/useAuth'
import { linkBluetoothDevice } from '@/src/lib/device-linking'

function PairDeviceComponent() {
  const { user } = useAuth()
  const [isLinking, setIsLinking] = useState(false)

  const handleLinkDevice = async (bluetoothId: string, deviceName: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setIsLinking(true)
    try {
      const device = await linkBluetoothDevice(user.id, bluetoothId, deviceName)
      // Device successfully linked, update UI
      console.log('Device linked:', device)
    } catch (error) {
      // Handle error
      console.error('Failed to link device:', error)
    } finally {
      setIsLinking(false)
    }
  }

  return (
    // Your UI here
  )
}
*/


