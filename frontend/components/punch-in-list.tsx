"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Check, History, Calendar, Plus, ArrowUpDown, Edit, Trash2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useHabitTracker } from "./habit-tracker-context"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define sort types
type SortField = "points" | "monthly" | "total" | "name" | "streak"
type SortDirection = "asc" | "desc"

export function PunchInList() {
  const {
    punchInTasks,
    getTaskCountForMonth,
    getTaskCountForToday,
    addPunchInTask,
    editPunchInTask,
    deletePunchInTask,
  } = useHabitTracker()

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskPoints, setNewTaskPoints] = useState("5")

  // Edit task dialog state
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editTaskId, setEditTaskId] = useState<number | null>(null)
  const [editTaskName, setEditTaskName] = useState("")
  const [editTaskPoints, setEditTaskPoints] = useState("")
  const [editTaskStreak, setEditTaskStreak] = useState("")
  const [editTaskHistoricalCount, setEditTaskHistoricalCount] = useState("")

  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("points")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const currentMonth = format(new Date(), "MMMM yyyy")

  // Open edit dialog and populate with task data
  const openEditDialog = (taskId: number) => {
    const taskToEdit = punchInTasks.find((task) => task.id === taskId)
    if (!taskToEdit) return

    setEditTaskId(taskId)
    setEditTaskName(taskToEdit.name)
    setEditTaskPoints(taskToEdit.points.toString())
    setEditTaskStreak(taskToEdit.streak.toString())
    setEditTaskHistoricalCount(taskToEdit.historicalCount.toString())
    setIsEditTaskOpen(true)
  }

  // Open delete confirmation dialog
  const openDeleteConfirmDialog = (taskId: number) => {
    setDeleteTaskId(taskId)
    setIsDeleteConfirmOpen(true)
  }

  const handleAddTask = () => {
    if (newTaskName.trim() === "") {
      alert("Task name cannot be empty")
      return
    }

    const points = Number.parseInt(newTaskPoints)
    if (isNaN(points) || points <= 0) {
      alert("Points must be a positive number")
      return
    }

    addPunchInTask(newTaskName, points)
    setIsAddTaskOpen(false)
    setNewTaskName("")
    setNewTaskPoints("5")
  }

  // Function to save edited task
  const handleSaveEdit = () => {
    if (!editTaskId) return

    if (editTaskName.trim() === "") {
      alert("Task name cannot be empty")
      return
    }

    const points = Number.parseInt(editTaskPoints)
    if (isNaN(points) || points <= 0) {
      alert("Points must be a positive number")
      return
    }

    const streak = Number.parseInt(editTaskStreak)
    if (isNaN(streak) || streak < 0) {
      alert("Streak must be a non-negative number")
      return
    }

    const historicalCount = Number.parseInt(editTaskHistoricalCount)
    if (isNaN(historicalCount) || historicalCount < 0) {
      alert("Historical count must be a non-negative number")
      return
    }

    // Update the task using the context function
    editPunchInTask(editTaskId, editTaskName, points, historicalCount, streak)
    setIsEditTaskOpen(false)
  }

  // Function to delete a task
  const handleDeleteTask = () => {
    if (!deleteTaskId) return
    deletePunchInTask(deleteTaskId)
    setIsDeleteConfirmOpen(false)
  }

  // Function to handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default direction
      setSortField(field)
      setSortDirection("desc") // Default to descending
    }
  }

  // Sort the tasks based on current sort field and direction
  const sortedTasks = [...punchInTasks].sort((a, b) => {
    let comparison = 0

    if (sortField === "points") {
      comparison = a.points - b.points
    } else if (sortField === "monthly") {
      comparison = getTaskCountForMonth(a.name) - getTaskCountForMonth(b.name)
    } else if (sortField === "total") {
      comparison = a.historicalCount - b.historicalCount
    } else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "streak") {
      comparison = a.streak - b.streak
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Get sort indicator
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null

    return <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Punch-in Events</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {currentMonth}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("points")}>
                Points {getSortIndicator("points")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("monthly")}>
                Monthly Count {getSortIndicator("monthly")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("total")}>
                Total Count {getSortIndicator("total")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("streak")}>
                Streak {getSortIndicator("streak")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("name")}>Name {getSortIndicator("name")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to track in your punch-in events.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    placeholder="e.g., Read a book"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="points">Points per Completion</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    placeholder="5"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scrollable container for cards */}
      <ScrollArea className="flex-1 h-[400px] pr-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedTasks.map((item) => {
            const monthlyCount = getTaskCountForMonth(item.name)
            const todayCount = getTaskCountForToday(item.name)

            return (
              <Card key={item.id} className="overflow-hidden flex flex-col">
                <CardHeader className="p-4 pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base truncate max-w-[70%]" title={item.name}>
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="font-normal min-w-[50px] text-center">
                        {item.points} pts
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Task</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteConfirmDialog(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Task</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    {item.points} points per completion
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                              <Calendar className="h-3 w-3" />
                              <span>Monthly: {monthlyCount}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Completions this month</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                              <History className="h-3 w-3" />
                              <span>Total: {item.historicalCount}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>All-time completions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/10 p-3 flex-shrink-0 h-[42px]">
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 min-w-0 flex-shrink">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        Current streak: {item.streak} {item.streak === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className="whitespace-nowrap">Today: </span>
                      {todayCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="h-5 w-5 flex items-center justify-center p-0 bg-green-50 text-green-700 border-green-200"
                        >
                          {todayCount}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-5 w-5 flex items-center justify-center p-0 bg-muted/30 text-muted-foreground"
                        >
                          0
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </ScrollArea>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and statistics.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTaskName">Task Name</Label>
              <Input
                id="editTaskName"
                placeholder="e.g., Read a book"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editTaskPoints">Points per Completion</Label>
              <Input
                id="editTaskPoints"
                type="number"
                min="1"
                placeholder="5"
                value={editTaskPoints}
                onChange={(e) => setEditTaskPoints(e.target.value)}
              />
            </div>
            <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Editing the following values will directly modify your statistics.</AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editTaskStreak">Current Streak</Label>
                <Input
                  id="editTaskStreak"
                  type="number"
                  min="0"
                  value={editTaskStreak}
                  onChange={(e) => setEditTaskStreak(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editTaskHistoricalCount">Historical Count</Label>
                <Input
                  id="editTaskHistoricalCount"
                  type="number"
                  min="0"
                  value={editTaskHistoricalCount}
                  onChange={(e) => setEditTaskHistoricalCount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>All historical data for this task will be permanently lost.</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

