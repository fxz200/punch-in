"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, AlertCircle, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useHabitTracker } from "./habit-tracker-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DayEventsModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
}

export function DayEventsModal({ isOpen, onClose, date }: DayEventsModalProps) {
  const {
    completedTasksByDate,
    addEventToDate,
    removeEventFromDate,
    removeAllTasksOfTypeFromDate,
    taskColors,
    punchInTasks,
    isToday,
  } = useHabitTracker()

  const [selectedTask, setSelectedTask] = useState<string>("")
  const events = completedTasksByDate[date] || []
  const dayIsToday = isToday(date)

  // Reset selected task when modal opens
  useEffect(() => {
    if (isOpen && punchInTasks.length > 0) {
      setSelectedTask(punchInTasks[0].name)
    }
  }, [isOpen, punchInTasks])

  // Format date for display
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return `${month}/${day}/${year}`
  }

  // Count occurrences of each task
  const getTaskCounts = () => {
    const taskCounts: Record<string, number> = {}
    events.forEach((task) => {
      taskCounts[task] = (taskCounts[task] || 0) + 1
    })
    return taskCounts
  }

  const taskCounts = getTaskCounts()
  const uniqueTasks = [...new Set(events)]

  // Add a new task
  const handleAddTask = () => {
    if (selectedTask) {
      addEventToDate(date, selectedTask)
      // Don't reset selectedTask to keep the dropdown on the current selection
    }
  }

  // Remove one occurrence of a task
  const handleRemoveTask = (task: string) => {
    const taskIndex = events.indexOf(task)
    if (taskIndex !== -1) {
      removeEventFromDate(date, taskIndex)
    }
  }

  // Remove all occurrences of a task
  const handleRemoveAllOfTask = (task: string) => {
    removeAllTasksOfTypeFromDate(date, task)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Events for {formatDate(date)}
            {dayIsToday && (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                Today
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Add or remove events for this day.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!dayIsToday && (
            <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You are editing historical data.</AlertDescription>
            </Alert>
          )}

          {/* Current events */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Events on this day</h3>
            {uniqueTasks.length > 0 ? (
              <div className="space-y-2">
                {uniqueTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-normal", taskColors[task] || "bg-gray-100 text-gray-700")}
                      >
                        {taskCounts[task] > 1 ? `×${taskCounts[task]}` : ""}
                      </Badge>
                      <span>{task}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTask(task)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {taskCounts[task] > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveAllOfTask(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events for this day.</p>
            )}
          </div>

          {/* Add new event */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{dayIsToday ? "Add Event" : "Add Historical Event"}</h3>
            <div className="flex gap-2">
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {punchInTasks.map((task) => (
                    <SelectItem key={task.id} value={task.name}>
                      {task.name} ({task.points} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleAddTask} disabled={!selectedTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

