import { NextRequest, NextResponse } from 'next/server'
import { updateDeviceLocation } from '@/lib/devices'

/**
 * POST /api/devices/[deviceId]/location
 * Update device location
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params
    const body = await request.json()
    const { latitude, longitude, accuracy } = body

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      )
    }

    const device = await updateDeviceLocation(deviceId, {
      latitude,
      longitude,
      accuracy: accuracy || undefined,
    })

    return NextResponse.json({ success: true, device })
  } catch (error: any) {
    console.error('Error updating device location:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update device location' },
      { status: 500 }
    )
  }
}
