import * as React from "react"
import { MonitorX } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg">
        <Card className="border-brand-surface bg-brand-dark">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-white">
              <MonitorX className="h-4 w-4" /> {/* Close icon placeholder using MonitorX or X usually */}
              <span className="sr-only">Close</span>
              ✕
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { Modal }
