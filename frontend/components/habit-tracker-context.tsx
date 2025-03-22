"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { format } from "date-fns"

// Define the task colors
export const initialTaskColors: Record<string, string> = {
  "code war >5 kata": "bg-blue-100 text-blue-700 border-blue-200",
  "code war <5 kata": "bg-red-100 text-red-700 border-red-200",
  "push a commit": "bg-green-100 text-green-700 border-green-200",
  "background knowledge study": "bg-purple-100 text-purple-700 border-purple-200",
  "organize notes": "bg-amber-100 text-amber-700 border-amber-200",
  "W3 school (1 page)": "bg-indigo-100 text-indigo-700 border-indigo-200",
  reading: "bg-orange-100 text-orange-700 border-orange-200",
  DSA: "bg-cyan-100 text-cyan-700 border-cyan-200",
  "TOEIC study 1 hour": "bg-pink-100 text-pink-700 border-pink-200",
  "Leetcode easy": "bg-emerald-100 text-emerald-700 border-emerald-200",
}

// Available tasks for adding
export const availableTasks = [
  "push a commit",
  "code war >5 kata",
  "code war <5 kata",
  "W3 school (1 page)",
  "reading",
  "background knowledge study",
  "organize notes",
  "DSA",
  "TOEIC study 1 hour",
  "Leetcode easy",
]

// Add more sample data to ensure charts have data to display

// Update the initialCompletedTasksByDate with more data
const initialCompletedTasksByDate = {
  "2025-03-01": ["code war >5 kata", "push a commit", "reading", "organize notes"],
  "2025-03-02": ["push a commit", "reading"],
  "2025-03-03": ["code war >5 kata", "background knowledge study"],
  "2025-03-04": ["push a commit", "DSA"],
  "2025-03-05": ["code war >5 kata", "code war >5 kata", "reading"],
  "2025-03-06": ["push a commit", "W3 school (1 page)"],
  "2025-03-07": ["background knowledge study", "organize notes"],
  "2025-03-08": ["push a commit", "reading", "DSA"],
  "2025-03-09": ["code war >5 kata", "push a commit"],
  "2025-03-10": ["code war >5 kata", "background knowledge study", "reading"],
  "2025-03-11": ["push a commit", "organize notes"],
  "2025-03-12": ["code war >5 kata", "DSA"],
  "2025-03-13": ["push a commit", "W3 school (1 page)"],
  "2025-03-14": ["background knowledge study", "reading"],
  "2025-03-15": ["code war >5 kata", "organize notes", "organize notes", "push a commit"],
  "2025-03-16": ["push a commit", "reading"],
  "2025-03-17": ["code war >5 kata", "DSA"],
  "2025-03-18": ["push a commit", "background knowledge study"],
  "2025-03-19": ["code war >5 kata", "W3 school (1 page)"],
  "2025-03-20": ["code war >5 kata", "push a commit", "push a commit", "reading"],
  "2025-03-21": ["background knowledge study", "organize notes"],
  "2025-03-22": ["push a commit", "DSA"],
  "2025-03-23": ["code war >5 kata", "reading"],
  "2025-03-24": ["push a commit", "W3 school (1 page)"],
  "2025-03-25": ["code war <5 kata", "push a commit", "background knowledge study"],
  "2025-03-26": ["organize notes", "reading"],
  "2025-03-27": ["push a commit", "DSA"],
  "2025-03-28": ["code war >5 kata", "W3 school (1 page)"],
  "2025-03-29": ["push a commit", "background knowledge study"],
  "2025-03-30": ["code war >5 kata", "reading"],
  "2025-03-31": ["push a commit", "organize notes", "push a commit", "DSA"],
}

// Sample data for punch-in tasks
const initialPunchInTasks = [
  { id: 1, name: "push a commit", points: 5, historicalCount: 23, streak: 5 },
  { id: 2, name: "code war >5 kata", points: 5, historicalCount: 18, streak: 3 },
  { id: 3, name: "W3 school (1 page)", points: 2, historicalCount: 7, streak: 0 },
  { id: 4, name: "reading", points: 6, historicalCount: 12, streak: 2 },
  { id: 5, name: "background knowledge study", points: 4, historicalCount: 9, streak: 1 },
  { id: 6, name: "organize notes", points: 4, historicalCount: 5, streak: 0 },
]

// Initialize task visibility (all visible by default)
const initialTaskVisibility: Record<string, boolean> = {}
initialPunchInTasks.forEach((task) => {
  initialTaskVisibility[task.name] = true
})

// Add a new type for month card data
export interface MonthCard {
  id: string
  month: Date
  targetPoints: number
  earnedPoints: number
  rewards: {
    name: string
    points: number
    claimed: boolean
  }[]
  completedEvents: number
  completedPunchIns: number
  imageUrl?: string
  summary?: string // Add summary field
}

// Add sample data for months
const initialMonths: MonthCard[] = [
  {
    id: "2025-01",
    month: new Date(2025, 0, 1), // January 2025
    targetPoints: 180,
    earnedPoints: 165,
    rewards: [
      { name: "New Book", points: 100, claimed: true },
      { name: "Movie Night", points: 150, claimed: true },
    ],
    completedEvents: 10,
    completedPunchIns: 18,
    imageUrl: "https://images.unsplash.com/photo-1546271876-af6caec5fae6?q=80&w=500&auto=format&fit=crop",
    summary: "Focus on building coding fundamentals and completing the React course.",
  },
  {
    id: "2025-02",
    month: new Date(2025, 1, 1), // February 2025
    targetPoints: 200,
    earnedPoints: 185,
    rewards: [
      { name: "New Headphones", points: 150, claimed: true },
      { name: "Weekend Trip", points: 300, claimed: false },
    ],
    completedEvents: 12,
    completedPunchIns: 20,
    imageUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=500&auto=format&fit=crop",
    summary: "Work on personal project and improve TypeScript skills.",
  },
  {
    id: "2025-03",
    month: new Date(2025, 2, 1), // March 2025
    targetPoints: 200,
    earnedPoints: 120,
    rewards: [
      { name: "New Book", points: 150, claimed: false },
      { name: "Movie Night", points: 200, claimed: false },
    ],
    completedEvents: 8,
    completedPunchIns: 10,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format&fit=crop",
    summary: "Prepare for technical interviews and contribute to open source.",
  },
]

// Get today's date in YYYY-MM-DD format
const getTodayString = () => format(new Date(), "yyyy-MM-dd")

// Get current month in YYYY-MM format
const getCurrentMonthString = () => format(new Date(), "yyyy-MM")

// Add a new type for calendar display mode
export type CalendarDisplayMode = "badges" | "dots"

// Update the context type definition to include display mode
type HabitTrackerContextType = {
  completedTasksByDate: Record<string, string[]>
  punchInTasks: Array<{
    id: number
    name: string
    points: number
    historicalCount: number
    streak: number
  }>
  months: MonthCard[]
  setMonths: (months: MonthCard[]) => void
  getCurrentMonthData: () => MonthCard | undefined
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  addEventToDate: (date: string, taskName: string) => void
  removeEventFromDate: (date: string, taskIndex: number) => void
  removeAllTasksOfTypeFromDate: (date: string, taskName: string) => void
  getTodayEvents: () => string[]
  getTaskCountForToday: (taskName: string) => number
  getTaskCountForMonth: (taskName: string) => number
  incrementTaskForToday: (taskName: string) => void
  decrementTaskForToday: (taskName: string) => void
  addPunchInTask: (name: string, points: number) => void
  editPunchInTask: (id: number, name: string, points: number, historicalCount: number, streak: number) => void
  deletePunchInTask: (id: number) => void
  taskColors: Record<string, string>
  setTaskColors: (colors: Record<string, string>) => void
  taskVisibility: Record<string, boolean>
  setTaskVisibility: (visibility: Record<string, boolean>) => void
  calendarDisplayMode: CalendarDisplayMode
  setCalendarDisplayMode: (mode: CalendarDisplayMode) => void
  availableTasks: string[]
  isToday: (date: string) => boolean
  getCurrentMonth: () => string
  displayedMonth: Date
  setDisplayedMonth: (date: Date) => void
  getMonthDataForDate: (date: Date) => MonthCard | undefined
}

// Create the context
const HabitTrackerContext = createContext<HabitTrackerContextType | undefined>(undefined)

// In the provider component, add the new state
export function HabitTrackerProvider({ children }: { children: ReactNode }) {
  const [completedTasksByDate, setCompletedTasksByDate] = useState(initialCompletedTasksByDate)
  const [punchInTasks, setPunchInTasks] = useState(initialPunchInTasks)
  const [months, setMonths] = useState(initialMonths)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [nextTaskId, setNextTaskId] = useState(7) // Start after the last initial task ID
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date())
  const [taskColors, setTaskColors] = useState(initialTaskColors)
  const [taskVisibility, setTaskVisibility] = useState(initialTaskVisibility)
  const [calendarDisplayMode, setCalendarDisplayMode] = useState<CalendarDisplayMode>("badges")

  // Get current month data
  const getCurrentMonthData = () => {
    const now = new Date()
    return months.find(
      (month) => month.month.getFullYear() === now.getFullYear() && month.month.getMonth() === now.getMonth(),
    )
  }

  // Check if a date is today
  const isToday = (date: string) => date === getTodayString()

  // Get current month
  const getCurrentMonth = () => getCurrentMonthString()

  // Get events for today
  const getTodayEvents = () => {
    const today = getTodayString()
    return completedTasksByDate[today] || []
  }

  // Get count of a specific task for today
  const getTaskCountForToday = (taskName: string) => {
    const todayEvents = getTodayEvents()
    return todayEvents.filter((task) => task === taskName).length
  }

  // Get count of a specific task for the current month
  const getTaskCountForMonth = (taskName: string) => {
    const currentMonth = getCurrentMonthString()
    let count = 0

    Object.entries(completedTasksByDate).forEach(([date, tasks]) => {
      if (date.startsWith(currentMonth)) {
        count += tasks.filter((task) => task === taskName).length
      }
    })

    return count
  }

  // Add a new punch-in task
  const addPunchInTask = (name: string, points: number) => {
    // Check if task with this name already exists
    if (punchInTasks.some((task) => task.name === name)) {
      alert("A task with this name already exists")
      return
    }

    const newTask = {
      id: nextTaskId,
      name,
      points,
      historicalCount: 0,
      streak: 0,
    }

    setPunchInTasks([...punchInTasks, newTask])
    setNextTaskId(nextTaskId + 1)

    // Also add to available tasks and task colors
    // Note: In a real app, you'd want to persist these changes
    // This is just for the demo
    const colorOptions = [
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-lime-100 text-lime-700 border-lime-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-sky-100 text-sky-700 border-sky-200",
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    ]

    // Assign a random color from the options
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)]
    setTaskColors({
      ...taskColors,
      [name]: randomColor,
    })

    // Set task visibility to true by default
    setTaskVisibility({
      ...taskVisibility,
      [name]: true,
    })
  }

  // Edit an existing punch-in task
  const editPunchInTask = (id: number, name: string, points: number, historicalCount: number, streak: number) => {
    // Check if task with this name already exists (except for the one being edited)
    if (punchInTasks.some((task) => task.name === name && task.id !== id)) {
      alert("A task with this name already exists")
      return
    }

    const oldTask = punchInTasks.find((task) => task.id === id)
    const oldName = oldTask?.name || ""

    setPunchInTasks(
      punchInTasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            name,
            points,
            historicalCount,
            streak,
          }
        }
        return task
      }),
    )

    // If name changed, update taskColors and taskVisibility
    if (oldName && oldName !== name) {
      const newTaskColors = { ...taskColors }
      const newTaskVisibility = { ...taskVisibility }

      // Transfer color and visibility settings to new name
      if (newTaskColors[oldName]) {
        newTaskColors[name] = newTaskColors[oldName]
        delete newTaskColors[oldName]
      }

      if (newTaskVisibility[oldName] !== undefined) {
        newTaskVisibility[name] = newTaskVisibility[oldName]
        delete newTaskVisibility[oldName]
      }

      setTaskColors(newTaskColors)
      setTaskVisibility(newTaskVisibility)
    }
  }

  // Delete a punch-in task
  const deletePunchInTask = (id: number) => {
    const taskToDelete = punchInTasks.find((task) => task.id === id)
    if (taskToDelete) {
      // Remove from taskColors and taskVisibility
      const newTaskColors = { ...taskColors }
      const newTaskVisibility = { ...taskVisibility }

      delete newTaskColors[taskToDelete.name]
      delete newTaskVisibility[taskToDelete.name]

      setTaskColors(newTaskColors)
      setTaskVisibility(newTaskVisibility)
    }

    setPunchInTasks(punchInTasks.filter((task) => task.id !== id))
  }

  // Add an event to a specific date
  const addEventToDate = (date: string, taskName: string) => {
    const updatedTasks = {
      ...completedTasksByDate,
      [date]: [...(completedTasksByDate[date] || []), taskName],
    }
    setCompletedTasksByDate(updatedTasks)

    // If it's today, also update the task's historical count
    if (isToday(date)) {
      updateTaskHistoricalCount(taskName, 1)
    }
  }

  // Remove an event from a specific date by index
  const removeEventFromDate = (date: string, taskIndex: number) => {
    if (!completedTasksByDate[date]) return

    const taskName = completedTasksByDate[date][taskIndex]
    const updatedDateEvents = [...completedTasksByDate[date]]
    updatedDateEvents.splice(taskIndex, 1)

    setCompletedTasksByDate({
      ...completedTasksByDate,
      [date]: updatedDateEvents,
    })

    // If it's today, also update the task's historical count
    if (isToday(date)) {
      updateTaskHistoricalCount(taskName, -1)
    }
  }

  // Remove all tasks of a specific type from a date
  const removeAllTasksOfTypeFromDate = (date: string, taskName: string) => {
    if (!completedTasksByDate[date]) return

    const tasksToRemove = completedTasksByDate[date].filter((task) => task === taskName).length
    const updatedDateEvents = completedTasksByDate[date].filter((task) => task !== taskName)

    setCompletedTasksByDate({
      ...completedTasksByDate,
      [date]: updatedDateEvents,
    })

    // If it's today, also update the task's historical count
    if (isToday(date)) {
      updateTaskHistoricalCount(taskName, -tasksToRemove)
    }
  }

  // Increment a task for today
  const incrementTaskForToday = (taskName: string) => {
    const today = getTodayString()
    addEventToDate(today, taskName)
  }

  // Decrement a task for today (remove the most recent one)
  const decrementTaskForToday = (taskName: string) => {
    const today = getTodayString()
    const todayEvents = completedTasksByDate[today] || []

    // Find the last occurrence of this task
    const lastIndex = [...todayEvents].reverse().findIndex((task) => task === taskName)

    if (lastIndex !== -1) {
      // Convert back to the correct index in the original array
      const indexToRemove = todayEvents.length - 1 - lastIndex
      removeEventFromDate(today, indexToRemove)
    }
  }

  // Update a task's historical count
  const updateTaskHistoricalCount = (taskName: string, change: number) => {
    setPunchInTasks(
      punchInTasks.map((task) =>
        task.name === taskName
          ? {
              ...task,
              historicalCount: Math.max(0, task.historicalCount + change),
              streak: change > 0 ? task.streak + 1 : Math.max(0, task.streak - 1),
            }
          : task,
      ),
    )
  }

  // Add a function to get month data for any date
  const getMonthDataForDate = (date: Date) => {
    return months.find(
      (month) => month.month.getFullYear() === date.getFullYear() && month.month.getMonth() === date.getMonth(),
    )
  }

  return (
    <HabitTrackerContext.Provider
      value={{
        completedTasksByDate,
        punchInTasks,
        months,
        setMonths,
        getCurrentMonthData,
        selectedDate,
        setSelectedDate,
        addEventToDate,
        removeEventFromDate,
        removeAllTasksOfTypeFromDate,
        getTodayEvents,
        getTaskCountForToday,
        getTaskCountForMonth,
        incrementTaskForToday,
        decrementTaskForToday,
        addPunchInTask,
        editPunchInTask,
        deletePunchInTask,
        taskColors,
        setTaskColors,
        taskVisibility,
        setTaskVisibility,
        calendarDisplayMode,
        setCalendarDisplayMode,
        availableTasks,
        isToday,
        getCurrentMonth,
        displayedMonth,
        setDisplayedMonth,
        getMonthDataForDate,
      }}
    >
      {children}
    </HabitTrackerContext.Provider>
  )
}

// Custom hook to use the context
export function useHabitTracker() {
  const context = useContext(HabitTrackerContext)
  if (context === undefined) {
    throw new Error("useHabitTracker must be used within a HabitTrackerProvider")
  }
  return context
}

