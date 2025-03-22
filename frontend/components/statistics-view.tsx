"use client"

import { useState, useMemo } from "react"
import {
  format,
  eachDayOfInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns"
import {
  Calendar,
  Trophy,
  Target,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Flame,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHabitTracker } from "./habit-tracker-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

export function StatisticsView() {
  const {
    completedTasksByDate,
    punchInTasks,
    taskColors,
    taskVisibility,
    getTaskCountForMonth,
    displayedMonth,
    setDisplayedMonth,
  } = useHabitTracker()

  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({})

  // Initialize selectedTasks with all tasks visible by default
  useMemo(() => {
    const initialSelectedTasks: Record<string, boolean> = {}
    punchInTasks.forEach((task) => {
      // If not explicitly set, use the value from taskVisibility or default to true
      initialSelectedTasks[task.name] =
        selectedTasks[task.name] !== undefined ? selectedTasks[task.name] : taskVisibility[task.name] !== false
    })
    setSelectedTasks(initialSelectedTasks)
  }, [punchInTasks, taskVisibility])

  // Format the displayed month
  const formattedMonth = format(displayedMonth, "MMMM yyyy")
  const isCurrentMonth = isSameMonth(displayedMonth, new Date())

  // Navigate to previous/next month
  const prevMonth = () => {
    setDisplayedMonth(subMonths(displayedMonth, 1))
  }

  const nextMonth = () => {
    setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1))
  }

  // Calculate date range based on selected time range and displayed month
  const dateRange = useMemo(() => {
    if (timeRange === "week") {
      // Show the week containing the 15th of the displayed month
      const middleOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 15)
      return eachDayOfInterval({
        start: startOfWeek(middleOfMonth),
        end: endOfWeek(middleOfMonth),
      })
    } else if (timeRange === "month") {
      return eachDayOfInterval({
        start: startOfMonth(displayedMonth),
        end: endOfMonth(displayedMonth),
      })
    } else {
      // For year, show the entire year of the displayed month
      return eachDayOfInterval({
        start: startOfYear(new Date(displayedMonth.getFullYear(), 0, 1)),
        end: endOfYear(new Date(displayedMonth.getFullYear(), 11, 31)),
      })
    }
  }, [timeRange, displayedMonth])

  // Filter tasks based on visibility and selected tasks
  const filteredTasksByDate = useMemo(() => {
    const result: Record<string, string[]> = {}

    // If viewing by year, include all dates for the year
    if (timeRange === "year") {
      Object.entries(completedTasksByDate).forEach(([date, tasks]) => {
        const taskDate = parseISO(date)
        if (taskDate.getFullYear() === displayedMonth.getFullYear()) {
          // Filter tasks based on selectedTasks
          const filteredTasks = tasks.filter((task) => selectedTasks[task] !== false)
          if (filteredTasks.length > 0) {
            result[date] = filteredTasks
          }
        }
      })
    }
    // If viewing by month, include all dates for the month
    else if (timeRange === "month") {
      Object.entries(completedTasksByDate).forEach(([date, tasks]) => {
        const taskDate = parseISO(date)
        if (
          taskDate.getFullYear() === displayedMonth.getFullYear() &&
          taskDate.getMonth() === displayedMonth.getMonth()
        ) {
          // Filter tasks based on selectedTasks
          const filteredTasks = tasks.filter((task) => selectedTasks[task] !== false)
          if (filteredTasks.length > 0) {
            result[date] = filteredTasks
          }
        }
      })
    }
    // If viewing by week, include dates in the selected week
    else {
      const startDate = startOfWeek(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 15))
      const endDate = endOfWeek(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 15))

      Object.entries(completedTasksByDate).forEach(([date, tasks]) => {
        const taskDate = parseISO(date)
        if (taskDate >= startDate && taskDate <= endDate) {
          // Filter tasks based on selectedTasks
          const filteredTasks = tasks.filter((task) => selectedTasks[task] !== false)
          if (filteredTasks.length > 0) {
            result[date] = filteredTasks
          }
        }
      })
    }

    return result
  }, [completedTasksByDate, displayedMonth, timeRange, selectedTasks])

  // Calculate total points earned for the filtered period
  const totalPoints = useMemo(() => {
    let total = 0

    Object.entries(filteredTasksByDate).forEach(([date, tasks]) => {
      tasks.forEach((taskName) => {
        const task = punchInTasks.find((t) => t.name === taskName)
        if (task) {
          total += task.points
        }
      })
    })

    return total
  }, [filteredTasksByDate, punchInTasks])

  // Calculate total tasks completed for the filtered period
  const totalTasksCompleted = useMemo(() => {
    return Object.values(filteredTasksByDate).reduce((acc, tasks) => acc + tasks.length, 0)
  }, [filteredTasksByDate])

  // Calculate most completed task for the filtered period
  const mostCompletedTask = useMemo(() => {
    const taskCounts: Record<string, number> = {}

    Object.values(filteredTasksByDate).forEach((tasks) => {
      tasks.forEach((taskName) => {
        taskCounts[taskName] = (taskCounts[taskName] || 0) + 1
      })
    })

    let maxCount = 0
    let taskName = ""

    Object.entries(taskCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count
        taskName = name
      }
    })

    return { name: taskName, count: maxCount }
  }, [filteredTasksByDate])

  // Calculate highest value task based on points earned in the period
  const highestValueTask = useMemo(() => {
    const taskPoints: Record<string, number> = {}

    Object.values(filteredTasksByDate).forEach((tasks) => {
      tasks.forEach((taskName) => {
        const task = punchInTasks.find((t) => t.name === taskName)
        if (task) {
          taskPoints[taskName] = (taskPoints[taskName] || 0) + task.points
        }
      })
    })

    let maxPoints = 0
    let taskName = ""

    Object.entries(taskPoints).forEach(([name, points]) => {
      if (points > maxPoints) {
        maxPoints = points
        taskName = name
      }
    })

    const task = punchInTasks.find((t) => t.name === taskName)
    return task ? { name: taskName, points: maxPoints, pointsPerTask: task.points } : null
  }, [filteredTasksByDate, punchInTasks])

  // Prepare data for daily activity chart
  const dailyActivityData = useMemo(() => {
    // For year view, aggregate by month instead of day
    if (timeRange === "year") {
      const monthlyData: Record<string, { tasks: number; points: number }> = {}

      // Initialize all months
      for (let i = 0; i < 12; i++) {
        const monthKey = format(new Date(displayedMonth.getFullYear(), i, 1), "MMM")
        monthlyData[monthKey] = { tasks: 0, points: 0 }
      }

      // Aggregate data by month
      Object.entries(filteredTasksByDate).forEach(([date, tasks]) => {
        const taskDate = parseISO(date)
        const monthKey = format(taskDate, "MMM")

        monthlyData[monthKey].tasks += tasks.length

        tasks.forEach((taskName) => {
          const task = punchInTasks.find((t) => t.name === taskName)
          if (task) {
            monthlyData[monthKey].points += task.points
          }
        })
      })

      // Convert to array format for chart
      return Object.entries(monthlyData).map(([month, data]) => ({
        date: month,
        tasks: data.tasks,
        points: data.points,
      }))
    }

    // For week and month views, show daily data
    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const tasks = filteredTasksByDate[dateStr] || []

      let points = 0
      tasks.forEach((taskName) => {
        const task = punchInTasks.find((t) => t.name === taskName)
        if (task) {
          points += task.points
        }
      })

      return {
        date: format(date, timeRange === "month" ? "dd" : "MMM dd"),
        tasks: tasks.length,
        points,
      }
    })
  }, [dateRange, filteredTasksByDate, punchInTasks, timeRange, displayedMonth])

  // Prepare data for task distribution pie chart
  const taskDistributionData = useMemo(() => {
    const taskCounts: Record<string, number> = {}

    Object.values(filteredTasksByDate).forEach((tasks) => {
      tasks.forEach((taskName) => {
        taskCounts[taskName] = (taskCounts[taskName] || 0) + 1
      })
    })

    return Object.entries(taskCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 tasks
  }, [filteredTasksByDate])

  // Prepare data for points by task chart
  const pointsByTaskData = useMemo(() => {
    const taskPointsMap: Record<string, { points: number; completions: number }> = {}

    Object.values(filteredTasksByDate).forEach((tasks) => {
      tasks.forEach((taskName) => {
        const task = punchInTasks.find((t) => t.name === taskName)
        if (task) {
          if (!taskPointsMap[taskName]) {
            taskPointsMap[taskName] = { points: 0, completions: 0 }
          }
          taskPointsMap[taskName].points += task.points
          taskPointsMap[taskName].completions += 1
        }
      })
    })

    return Object.entries(taskPointsMap)
      .map(([name, data]) => ({
        name,
        points: data.points,
        completions: data.completions,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5) // Top 5 tasks by points
  }, [filteredTasksByDate, punchInTasks])

  // Get colors for pie chart
  const getTaskColor = (taskName: string) => {
    const color = taskColors[taskName]
    if (color) {
      // Extract the color from the Tailwind class
      const match = color.match(/bg-(\w+)-100/)
      if (match && match[1]) {
        const colorName = match[1]
        // Map to more vibrant colors
        const colorMap: Record<string, string> = {
          blue: "#3b82f6",
          red: "#ef4444",
          green: "#22c55e",
          purple: "#a855f7",
          amber: "#f59e0b",
          indigo: "#6366f1",
          orange: "#f97316",
          cyan: "#06b6d4",
          pink: "#ec4899",
          emerald: "#10b981",
          teal: "#14b8a6",
          lime: "#84cc16",
          rose: "#f43f5e",
          sky: "#0ea5e9",
          fuchsia: "#d946ef",
          slate: "#64748b",
        }
        return colorMap[colorName] || "#64748b"
      }
    }
    return "#64748b" // Default color
  }

  // Get recent activity data
  const recentActivityData = useMemo(() => {
    return Object.entries(filteredTasksByDate)
      .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date descending
      .slice(0, 5) // Get 5 most recent days
  }, [filteredTasksByDate])

  // Get time range title
  const getTimeRangeTitle = () => {
    if (timeRange === "week") {
      const middleOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 15)
      const weekStart = format(startOfWeek(middleOfMonth), "MMM d")
      const weekEnd = format(endOfWeek(middleOfMonth), "MMM d, yyyy")
      return `${weekStart} - ${weekEnd}`
    } else if (timeRange === "month") {
      return formattedMonth
    } else {
      return `${displayedMonth.getFullYear()}`
    }
  }

  // Toggle task selection for filtering
  const toggleTaskSelection = (taskName: string) => {
    setSelectedTasks({
      ...selectedTasks,
      [taskName]: !selectedTasks[taskName],
    })
  }

  // Select all tasks
  const selectAllTasks = () => {
    const newSelectedTasks: Record<string, boolean> = {}
    punchInTasks.forEach((task) => {
      newSelectedTasks[task.name] = true
    })
    setSelectedTasks(newSelectedTasks)
  }

  // Deselect all tasks
  const deselectAllTasks = () => {
    const newSelectedTasks: Record<string, boolean> = {}
    punchInTasks.forEach((task) => {
      newSelectedTasks[task.name] = false
    })
    setSelectedTasks(newSelectedTasks)
  }

  // Count selected tasks
  const selectedTaskCount = useMemo(() => {
    return Object.values(selectedTasks).filter(Boolean).length
  }, [selectedTasks])

  // Find the maximum values for scaling
  const maxTasks = useMemo(() => {
    return Math.max(...dailyActivityData.map((d) => d.tasks), 1)
  }, [dailyActivityData])

  const maxPoints = useMemo(() => {
    return Math.max(...dailyActivityData.map((d) => d.points), 1)
  }, [dailyActivityData])

  const maxPointsByTask = useMemo(() => {
    return Math.max(...pointsByTaskData.map((d) => d.points), 1)
  }, [pointsByTaskData])

  const maxCompletionsByTask = useMemo(() => {
    return Math.max(...pointsByTaskData.map((d) => d.completions), 1)
  }, [pointsByTaskData])

  // Calculate total for task distribution
  const totalTaskDistribution = useMemo(() => {
    return taskDistributionData.reduce((sum, item) => sum + item.value, 0)
  }, [taskDistributionData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Statistics</h2>
          <Badge variant="outline" className={`${isCurrentMonth ? "bg-primary/10 text-primary" : ""}`}>
            {getTimeRangeTitle()}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-24 text-center">{formattedMonth}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Tabs defaultValue="month" className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week" onClick={() => setTimeRange("week")}>
                Week
              </TabsTrigger>
              <TabsTrigger value="month" onClick={() => setTimeRange("month")}>
                Month
              </TabsTrigger>
              <TabsTrigger value="year" onClick={() => setTimeRange("year")}>
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end">
        <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Tasks</span>
              {selectedTaskCount < punchInTasks.length && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {selectedTaskCount}/{punchInTasks.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-sm font-medium">Filter by Task</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={selectAllTasks}>
                  All
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={deselectAllTasks}>
                  None
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-2 space-y-1">
                {punchInTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`filter-task-${task.id}`}
                      checked={selectedTasks[task.name] !== false}
                      onCheckedChange={() => toggleTaskSelection(task.name)}
                    />
                    <Label
                      htmlFor={`filter-task-${task.id}`}
                      className="flex-1 text-sm cursor-pointer flex items-center"
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mr-2",
                          taskColors[task.name]?.replace("bg-", "bg-").replace("text-", "").replace("border-", "") ||
                            "bg-slate-400",
                        )}
                      />
                      {task.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "year"
                ? `Average ${Math.round(totalPoints / 12)} per month`
                : timeRange === "month"
                  ? `Average ${Math.round(totalPoints / dateRange.length)} per day`
                  : `Average ${Math.round(totalPoints / 7)} per day`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksCompleted}</div>
            <p className="text-xs text-muted-foreground">{Object.keys(taskDistributionData).length} different tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Valuable</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={highestValueTask?.name || "N/A"}>
              {highestValueTask?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {highestValueTask
                ? `${highestValueTask.points} pts (${highestValueTask.pointsPerTask} per task)`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Completed</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={mostCompletedTask.name}>
              {mostCompletedTask.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">{mostCompletedTask.count || 0} completions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Activity Chart - Custom Implementation */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {timeRange === "year" ? "Monthly Activity" : "Daily Activity"}
            </CardTitle>
            <CardDescription>Your task completions and points earned over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {dailyActivityData.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Tasks</span>
                  <span>Points</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  {dailyActivityData.map((day, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{day.date}</span>
                        <div className="flex gap-2">
                          <span className="text-purple-500">{day.tasks} tasks</span>
                          <span className="text-green-500">{day.points} pts</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Tasks</div>
                          <div className="flex-1">
                            <Progress
                              value={(day.tasks / maxTasks) * 100}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-purple-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Points</div>
                          <div className="flex-1">
                            <Progress
                              value={(day.points / maxPoints) * 100}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Distribution Chart - Custom Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Task Distribution
            </CardTitle>
            <CardDescription>Your most frequently completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {taskDistributionData.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2">
                  {taskDistributionData.map((task, index) => {
                    const percentage = totalTaskDistribution > 0 ? (task.value / totalTaskDistribution) * 100 : 0
                    return (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium truncate max-w-[200px]" title={task.name}>
                            {task.name}
                          </span>
                          <span>
                            {task.value} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getTaskColor(task.name),
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points by Task Chart - Custom Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Points by Task
            </CardTitle>
            <CardDescription>Your highest-value completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {pointsByTaskData.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Task</span>
                  <div className="flex gap-4">
                    <span>Points</span>
                    <span>Completions</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  {pointsByTaskData.map((task, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate max-w-[150px]" title={task.name}>
                          {task.name}
                        </span>
                        <div className="flex gap-4">
                          <span className="text-purple-500">{task.points} pts</span>
                          <span className="text-green-500">×{task.completions}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Points</div>
                          <div className="flex-1">
                            <Progress
                              value={(task.points / maxPointsByTask) * 100}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-purple-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Count</div>
                          <div className="flex-1">
                            <Progress
                              value={(task.completions / maxCompletionsByTask) * 100}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivityData.length > 0 ? (
                recentActivityData.map(([date, tasks]) => (
                  <div key={date} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{format(parseISO(date), "MMM dd, yyyy")}</span>
                    </div>
                    <Badge variant="outline">
                      {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pointsByTaskData.length > 0 ? (
                pointsByTaskData.map((task) => (
                  <div key={task.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          taskColors[task.name]?.replace("bg-", "bg-") || "bg-slate-400",
                        )}
                      />
                      <span className="truncate max-w-[150px]" title={task.name}>
                        {task.name}
                      </span>
                    </div>
                    <Badge variant="secondary">{task.points} pts</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Task Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taskDistributionData.length > 0 ? (
                taskDistributionData.map((task) => (
                  <div key={task.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          taskColors[task.name]?.replace("bg-", "bg-") || "bg-slate-400",
                        )}
                      />
                      <span className="truncate max-w-[150px]" title={task.name}>
                        {task.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        task.value >= 10
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : task.value >= 5
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                      )}
                    >
                      {task.value} {task.value === 1 ? "time" : "times"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

