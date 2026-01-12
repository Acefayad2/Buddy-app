"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"

interface DeviceIcon {
  type: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
  icon: string
  label: string
}

const deviceIcons: DeviceIcon[] = [
  { type: "phone", icon: "📱", label: "Phone" },
  { type: "tablet", icon: "📱", label: "Tablet" },
  { type: "watch", icon: "⌚", label: "Watch" },
  { type: "keys", icon: "🔑", label: "Keys" },
  { type: "earbuds", icon: "🎧", label: "Earbuds" },
  { type: "laptop", icon: "💻", label: "Laptop" },
]

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const [draggedIcon, setDraggedIcon] = useState<DeviceIcon | null>(null)

  const handleDragStart = (e: React.DragEvent, icon: DeviceIcon) => {
    setDraggedIcon(icon)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("deviceType", icon.type)
    e.dataTransfer.setData("text/plain", icon.type)
    // Create a custom drag image
    const dragImage = document.createElement("div")
    dragImage.innerHTML = `<div style="font-size: 48px; text-align: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">${icon.icon}</div>`
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 30, 30)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = () => {
    setDraggedIcon(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => {
        // Allow drag operations to pass through
        if (draggedIcon) {
          e.preventDefault()
        }
      }}>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Drag and drop a device icon into the "Your Devices" section below
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {deviceIcons.map((device) => (
            <div
              key={device.type}
              draggable
              onDragStart={(e) => handleDragStart(e, device)}
              onDragEnd={handleDragEnd}
              className={`
                flex flex-col items-center justify-center p-6 
                border-2 border-gray-200 rounded-lg cursor-grab
                hover:border-primary hover:bg-gray-50 transition-all
                ${draggedIcon?.type === device.type ? "opacity-50" : ""}
                active:cursor-grabbing
              `}
            >
              <div className="relative text-5xl mb-2 device-icon-wrapper" data-device-type={device.type}>
                {device.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{device.label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

