"use client"

import { useState } from "react"
import { Check, Plus, Clock, ListChecks, MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the status types
type EventStatus = "backlog" | "inprogress" | "completed"

// Define the event type
interface MajorEvent {
  id: number
  name: string
  points: number
  status: EventStatus
  completedDate?: string // Optional, only set when status is "completed"
}

// Define sort types
type SortField = "points" | "status" | "name" | "completedDate"
type SortDirection = "asc" | "desc"

export function MajorEventsList() {
  // Sample data with status field
  const [events, setEvents] = useState<MajorEvent[]>([
    { id: 1, name: "C# user API design", points: 50, status: "backlog" },
    { id: 2, name: "taskflow 夜原基本架構", points: 30, status: "completed", completedDate: "2025/03" },
    { id: 3, name: "taskflow sprint api design", points: 20, status: "completed", completedDate: "2025/03" },
    { id: 4, name: "go swagger setup", points: 20, status: "inprogress" },
  ])

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("points")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Add event dialog state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEventName, setNewEventName] = useState("")
  const [newEventPoints, setNewEventPoints] = useState("20")
  const [newEventStatus, setNewEventStatus] = useState<EventStatus>("backlog")

  // Edit event dialog state
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editEventId, setEditEventId] = useState<number | null>(null)
  const [editEventName, setEditEventName] = useState("")
  const [editEventPoints, setEditEventPoints] = useState("")
  const [editEventStatus, setEditEventStatus] = useState<EventStatus>("backlog")

  // Function to update the status of an event
  const updateStatus = (id: number, newStatus: EventStatus) => {
    setEvents(
      events.map((event) => {
        if (event.id === id) {
          // If status is changing to completed, set the completed date to current month
          if (newStatus === "completed" && event.status !== "completed") {
            const currentDate = new Date()
            const completedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}`
            return { ...event, status: newStatus, completedDate }
          }
          // If status is changing from completed to something else, remove the completed date
          else if (newStatus !== "completed" && event.status === "completed") {
            const { completedDate, ...rest } = event
            return { ...rest, status: newStatus }
          }
          // Otherwise just update the status
          return { ...event, status: newStatus }
        }
        return event
      }),
    )
  }

  // Function to open edit dialog
  const openEditDialog = (event: MajorEvent) => {
    setEditEventId(event.id)
    setEditEventName(event.name)
    setEditEventPoints(event.points.toString())
    setEditEventStatus(event.status)
    setIsEditEventOpen(true)
  }

  // Function to add a new event
  const handleAddEvent = () => {
    if (newEventName.trim() === "") {
      alert("Event name cannot be empty")
      return
    }

    const points = Number.parseInt(newEventPoints)
    if (isNaN(points) || points <= 0) {
      alert("Points must be a positive number")
      return
    }

    // Generate a new ID (in a real app, this would come from the backend)
    const newId = Math.max(0, ...events.map((e) => e.id)) + 1

    const newEvent: MajorEvent = {
      id: newId,
      name: newEventName,
      points,
      status: newEventStatus,
    }

    // If the status is completed, add the completed date
    if (newEventStatus === "completed") {
      const currentDate = new Date()
      newEvent.completedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}`
    }

    setEvents([...events, newEvent])
    setIsAddEventOpen(false)

    // Reset form
    setNewEventName("")
    setNewEventPoints("20")
    setNewEventStatus("backlog")
  }

  // Function to save edited event
  const handleSaveEdit = () => {
    if (!editEventId) return

    if (editEventName.trim() === "") {
      alert("Event name cannot be empty")
      return
    }

    const points = Number.parseInt(editEventPoints)
    if (isNaN(points) || points <= 0) {
      alert("Points must be a positive number")
      return
    }

    setEvents(
      events.map((event) => {
        if (event.id === editEventId) {
          const updatedEvent = {
            ...event,
            name: editEventName,
            points,
            status: editEventStatus,
          }

          // Handle completed date based on status change
          if (editEventStatus === "completed" && event.status !== "completed") {
            // If changing to completed, set the completed date
            const currentDate = new Date()
            updatedEvent.completedDate = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}`
          } else if (editEventStatus !== "completed" && event.status === "completed") {
            // If changing from completed to something else, remove the completed date
            delete updatedEvent.completedDate
          } else if (editEventStatus === "completed" && event.status === "completed") {
            // If already completed, keep the existing completed date
            updatedEvent.completedDate = event.completedDate
          }

          return updatedEvent
        }
        return event
      }),
    )

    setIsEditEventOpen(false)
  }

  // Function to delete an event
  const handleDeleteEvent = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== id))
    }
  }

  // Get the appropriate badge variant and text based on status
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "backlog":
        return {
          variant: "outline" as const,
          className: "bg-slate-100 text-slate-700 hover:bg-slate-100 hover:text-slate-700",
          text: "Backlog",
          icon: <ListChecks className="mr-1 h-3.5 w-3.5" />,
        }
      case "inprogress":
        return {
          variant: "outline" as const,
          className: "bg-amber-100 text-amber-700 hover:bg-amber-100 hover:text-amber-700",
          text: "In Progress",
          icon: <Clock className="mr-1 h-3.5 w-3.5" />,
        }
      case "completed":
        return {
          variant: "outline" as const,
          className: "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700",
          text: "Completed",
          icon: <Check className="mr-1 h-3.5 w-3.5" />,
        }
    }
  }

  // Function to handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default direction
      setSortField(field)
      setSortDirection("desc") // Default to descending for points, ascending for others
    }
  }

  // Get status weight for sorting (backlog: 0, inprogress: 1, completed: 2)
  const getStatusWeight = (status: EventStatus): number => {
    switch (status) {
      case "backlog":
        return 0
      case "inprogress":
        return 1
      case "completed":
        return 2
    }
  }

  // Sort the events based on current sort field and direction
  const sortedEvents = [...events].sort((a, b) => {
    let comparison = 0

    if (sortField === "points") {
      comparison = a.points - b.points
    } else if (sortField === "status") {
      comparison = getStatusWeight(a.status) - getStatusWeight(b.status)
    } else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "completedDate") {
      // Handle undefined completed dates for sorting
      const dateA = a.completedDate || ""
      const dateB = b.completedDate || ""
      comparison = dateA.localeCompare(dateB)
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Get sort indicator
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null

    return <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
  }

  // Get current month in YYYY/MM format
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Major Events</h2>
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
              <DropdownMenuItem onClick={() => handleSort("status")}>
                Status {getSortIndicator("status")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("name")}>Name {getSortIndicator("name")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("completedDate")}>
                Completed Date {getSortIndicator("completedDate")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setIsAddEventOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              <span>Add Event</span>
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>Create a new major event to track.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., API Design"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eventPoints">Points</Label>
                  <Input
                    id="eventPoints"
                    type="number"
                    min="1"
                    placeholder="20"
                    value={newEventPoints}
                    onChange={(e) => setNewEventPoints(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eventStatus">Status</Label>
                  <Select value={newEventStatus} onValueChange={(value) => setNewEventStatus(value as EventStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {newEventStatus === "completed" && (
                    <p className="text-xs text-muted-foreground">
                      This event will be marked as completed for the current month ({getCurrentMonth()}).
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-slate-100 text-slate-700 h-5 px-1.5">
            <ListChecks className="mr-1 h-3 w-3" />
            Backlog
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-amber-100 text-amber-700 h-5 px-1.5">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-green-100 text-green-700 h-5 px-1.5">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        </div>
      </div>

      {/* Scrollable table container */}
      <ScrollArea className="h-[400px] flex-1">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[300px]">Task</TableHead>
              <TableHead className="w-[100px] text-center">
                Points
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0 text-muted-foreground"
                  onClick={() => handleSort("points")}
                >
                  {getSortIndicator("points") || <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </TableHead>
              <TableHead className="w-[150px] text-center">
                Status
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0 text-muted-foreground"
                  onClick={() => handleSort("status")}
                >
                  {getSortIndicator("status") || <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                Completed Date
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0 text-muted-foreground"
                  onClick={() => handleSort("completedDate")}
                >
                  {getSortIndicator("completedDate") || <ArrowUpDown className="h-3 w-3" />}
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((event) => {
              const statusBadge = getStatusBadge(event.status)

              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{event.points}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant={statusBadge.variant}
                            className={`${statusBadge.className} cursor-pointer flex items-center gap-1 pr-1`}
                          >
                            {statusBadge.icon}
                            <span>{statusBadge.text}</span>
                            <MoreHorizontal className="h-3 w-3 ml-1 opacity-70" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem
                            onClick={() => updateStatus(event.id, "backlog")}
                            className={event.status === "backlog" ? "bg-slate-100" : ""}
                          >
                            <ListChecks className="mr-2 h-4 w-4" />
                            <span>Backlog</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(event.id, "inprogress")}
                            className={event.status === "inprogress" ? "bg-amber-100" : ""}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <span>In Progress</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(event.id, "completed")}
                            className={event.status === "completed" ? "bg-green-100" : ""}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            <span>Completed</span>
                            {event.status !== "completed" && (
                              <span className="ml-1 text-xs text-muted-foreground">({getCurrentMonth()})</span>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  <TableCell>{event.completedDate || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => openEditDialog(event)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editEventName">Event Name</Label>
              <Input
                id="editEventName"
                placeholder="e.g., API Design"
                value={editEventName}
                onChange={(e) => setEditEventName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEventPoints">Points</Label>
              <Input
                id="editEventPoints"
                type="number"
                min="1"
                placeholder="20"
                value={editEventPoints}
                onChange={(e) => setEditEventPoints(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEventStatus">Status</Label>
              <Select value={editEventStatus} onValueChange={(value) => setEditEventStatus(value as EventStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {editEventStatus === "completed" &&
                editEventId &&
                events.find((e) => e.id === editEventId)?.status !== "completed" && (
                  <p className="text-xs text-muted-foreground">
                    This event will be marked as completed for the current month ({getCurrentMonth()}).
                  </p>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

