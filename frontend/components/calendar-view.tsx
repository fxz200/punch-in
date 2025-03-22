"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DayEventsModal } from "./day-events-modal"
import { useHabitTracker } from "./habit-tracker-context"
import { TaskVisibilitySettings } from "./task-visibility-settings"

export function CalendarView() {
  const {
    completedTasksByDate,
    selectedDate,
    setSelectedDate,
    taskColors,
    taskVisibility,
    calendarDisplayMode,
    isToday,
    setDisplayedMonth,
  } = useHabitTracker()

  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2)) // March 2025
  const [isModalOpen, setIsModalOpen] = useState(false)

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    setDisplayedMonth(newMonth)
  }

  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    setDisplayedMonth(newMonth)
  }

  const handleDayClick = (day: number) => {
    const date = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const days = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border border-transparent p-1"></div>)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const tasksForDay = completedTasksByDate[date] || []
    const dayIsToday = isToday(date)

    // Filter tasks based on visibility settings
    const visibleTasks = tasksForDay.filter((task) => taskVisibility[task] !== false)

    days.push(
      <div
        key={day}
        className={cn(
          "h-24 border border-border p-1 transition-colors cursor-pointer",
          dayIsToday ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50",
        )}
        onClick={() => handleDayClick(day)}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className={cn("text-xs font-medium", dayIsToday && "text-primary font-semibold")}>
            {day}
            {dayIsToday && <span className="ml-1 text-[10px] text-primary">(Today)</span>}
          </span>
          <div className="flex items-center gap-1">
            {visibleTasks.length > 0 && (
              <Badge variant="outline" className="h-4 px-1 text-[10px]">
                {visibleTasks.length}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation()
                handleDayClick(day)
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {calendarDisplayMode === "badges" ? (
            // Badge display mode (original)
            (() => {
              // Count occurrences of each task
              const taskCounts: Record<string, number> = {}
              visibleTasks.forEach((task) => {
                taskCounts[task] = (taskCounts[task] || 0) + 1
              })

              // Get unique tasks
              const uniqueTasks = [...new Set(visibleTasks)]

              return uniqueTasks.slice(0, 2).map((task, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn("text-xs truncate justify-between font-normal", taskColors[task])}
                >
                  <span className="truncate">{task}</span>
                  {taskCounts[task] > 1 && (
                    <span className="ml-1 rounded-full bg-white/50 px-1 text-[10px]">×{taskCounts[task]}</span>
                  )}
                </Badge>
              ))
            })()
          ) : (
            // Dots display mode
            <div className="flex flex-wrap gap-1 mt-1">
              {visibleTasks.map((task, index) => {
                // Extract color from the task color class
                const colorClass = taskColors[task] || ""
                const colorMatch = colorClass.match(/bg-(\w+)-100/)
                const color = colorMatch ? colorMatch[1] : "gray"

                return <div key={index} className={`h-2.5 w-2.5 rounded-full bg-${color}-500`} title={task}></div>
              })}
            </div>
          )}
          {calendarDisplayMode === "badges" && [...new Set(visibleTasks)].length > 2 && (
            <span className="text-xs text-muted-foreground">+{[...new Set(visibleTasks)].length - 2} more</span>
          )}
        </div>
      </div>,
    )
  }

  useEffect(() => {
    setDisplayedMonth(currentMonth)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex items-center gap-2">
          <TaskVisibilitySettings />
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {monthName} {year}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days}
      </div>

      {selectedDate && <DayEventsModal isOpen={isModalOpen} onClose={handleCloseModal} date={selectedDate} />}
    </div>
  )
}

