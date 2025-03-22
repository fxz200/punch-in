"use client"

import { useState } from "react"
import { format, parse, addMonths, isSameMonth } from "date-fns"
import {
  CalendarIcon,
  Plus,
  Trophy,
  Target,
  Gift,
  Trash2,
  Edit,
  MoreHorizontal,
  X,
  ListChecks,
  Check,
  ImageIcon,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useHabitTracker } from "./habit-tracker-context"

// Remove the MonthCard interface since it's now in the context

export function MonthlyView() {
  // Get months from context
  const { months, setMonths } = useHabitTracker()

  // Add month dialog state
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false)
  const [newMonth, setNewMonth] = useState<string>(format(addMonths(new Date(), 1), "yyyy-MM"))
  const [newTargetPoints, setNewTargetPoints] = useState("200")
  const [newRewards, setNewRewards] = useState<{ name: string; points: string | number; claimed?: boolean }[]>([
    { name: "New Book", points: "150" },
    { name: "Movie Night", points: "200" },
  ])
  const [newImageUrl, setNewImageUrl] = useState("") // New state for image URL
  // Add summary field to the add month dialog
  const [newSummary, setNewSummary] = useState("")

  // Edit month dialog state
  const [isEditMonthOpen, setIsEditMonthOpen] = useState(false)
  const [editMonthId, setEditMonthId] = useState<string>("")
  const [editMonth, setEditMonth] = useState<string>("")
  const [editTargetPoints, setEditTargetPoints] = useState("")
  const [editEarnedPoints, setEditEarnedPoints] = useState("")
  const [editRewards, setEditRewards] = useState<{ name: string; points: string | number; claimed?: boolean }[]>([])
  const [editCompletedEvents, setEditCompletedEvents] = useState("")
  const [editCompletedPunchIns, setEditCompletedPunchIns] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("") // New state for edit image URL
  // Add summary field to the edit dialog state
  const [editSummary, setEditSummary] = useState("")

  // Open edit dialog and populate with month data
  const openEditDialog = (id: string) => {
    const monthToEdit = months.find((m) => m.id === id)
    if (!monthToEdit) return

    setEditMonthId(id)
    setEditMonth(format(monthToEdit.month, "yyyy-MM"))
    setEditTargetPoints(monthToEdit.targetPoints.toString())
    setEditEarnedPoints(monthToEdit.earnedPoints.toString())
    setEditRewards(
      monthToEdit.rewards.map((r) => ({
        name: r.name,
        points: r.points.toString(),
        claimed: r.claimed,
      })),
    )
    setEditCompletedEvents(monthToEdit.completedEvents.toString())
    setEditCompletedPunchIns(monthToEdit.completedPunchIns.toString())
    setEditImageUrl(monthToEdit.imageUrl || "")
    setEditSummary(monthToEdit.summary || "")
    setIsEditMonthOpen(true)
  }

  // Add a new reward input (for add dialog)
  const addReward = () => {
    setNewRewards([...newRewards, { name: "", points: "" }])
  }

  // Remove a reward input (for add dialog)
  const removeReward = (index: number) => {
    if (newRewards.length <= 1) return // Keep at least one reward
    const updatedRewards = [...newRewards]
    updatedRewards.splice(index, 1)
    setNewRewards(updatedRewards)
  }

  // Update reward name (for add dialog)
  const updateRewardName = (index: number, name: string) => {
    const updatedRewards = [...newRewards]
    updatedRewards[index].name = name
    setNewRewards(updatedRewards)
  }

  // Update reward points (for add dialog)
  const updateRewardPoints = (index: number, points: string) => {
    const updatedRewards = [...newRewards]
    updatedRewards[index].points = points
    setNewRewards(updatedRewards)
  }

  // Add a new reward input (for edit dialog)
  const addEditReward = () => {
    setEditRewards([...editRewards, { name: "", points: "" }])
  }

  // Remove a reward input (for edit dialog)
  const removeEditReward = (index: number) => {
    if (editRewards.length <= 1) return // Keep at least one reward
    const updatedRewards = [...editRewards]
    updatedRewards.splice(index, 1)
    setEditRewards(updatedRewards)
  }

  // Update reward name (for edit dialog)
  const updateEditRewardName = (index: number, name: string) => {
    const updatedRewards = [...editRewards]
    updatedRewards[index].name = name
    setEditRewards(updatedRewards)
  }

  // Update reward points (for edit dialog)
  const updateEditRewardPoints = (index: number, points: string) => {
    const updatedRewards = [...editRewards]
    updatedRewards[index].points = points
    setEditRewards(updatedRewards)
  }

  // Toggle reward claimed status (for edit dialog)
  const toggleEditRewardClaimed = (index: number) => {
    const updatedRewards = [...editRewards] as any[]
    updatedRewards[index].claimed = !updatedRewards[index].claimed
    setEditRewards(updatedRewards)
  }

  // Add a new month
  const handleAddMonth = () => {
    const monthDate = parse(newMonth, "yyyy-MM", new Date())

    // Check if month already exists
    if (months.some((m) => isSameMonth(m.month, monthDate))) {
      alert("This month already exists!")
      return
    }

    // Validate rewards
    const validRewards = newRewards.filter(
      (reward) => reward.name.trim() !== "" && reward.points !== "" && !isNaN(Number(reward.points)),
    )

    if (validRewards.length === 0) {
      alert("Please add at least one valid reward")
      return
    }

    const newMonthCard = {
      id: newMonth,
      month: monthDate,
      targetPoints: Number.parseInt(newTargetPoints),
      earnedPoints: 0,
      rewards: validRewards.map((reward) => ({
        name: reward.name,
        points: Number(reward.points),
        claimed: false,
      })),
      completedEvents: 0,
      completedPunchIns: 0,
      imageUrl: newImageUrl || undefined,
      summary: newSummary.trim() || undefined, // Add summary
    }

    setMonths([...months, newMonthCard])
    setIsAddMonthOpen(false)

    // Reset form
    setNewMonth(format(addMonths(new Date(), 1), "yyyy-MM"))
    setNewTargetPoints("200")
    setNewRewards([
      { name: "New Book", points: "150" },
      { name: "Movie Night", points: "200" },
    ])
    setNewImageUrl("")
    setNewSummary("")
  }

  // Save edited month
  const handleSaveEdit = () => {
    const monthDate = parse(editMonth, "yyyy-MM", new Date())

    // Check if month already exists (except the current one being edited)
    if (months.some((m) => m.id !== editMonthId && isSameMonth(m.month, monthDate))) {
      alert("This month already exists!")
      return
    }

    // Validate rewards
    const validRewards = editRewards.filter(
      (reward) => reward.name.trim() !== "" && reward.points !== "" && !isNaN(Number(reward.points)),
    )

    if (validRewards.length === 0) {
      alert("Please add at least one valid reward")
      return
    }

    // Validate points
    const targetPoints = Number(editTargetPoints)
    const earnedPoints = Number(editEarnedPoints)
    const completedEvents = Number(editCompletedEvents)
    const completedPunchIns = Number(editCompletedPunchIns)

    if (isNaN(targetPoints) || targetPoints <= 0) {
      alert("Target points must be a positive number")
      return
    }

    if (isNaN(earnedPoints) || earnedPoints < 0) {
      alert("Earned points must be a non-negative number")
      return
    }

    if (isNaN(completedEvents) || completedEvents < 0) {
      alert("Completed events must be a non-negative number")
      return
    }

    if (isNaN(completedPunchIns) || completedPunchIns < 0) {
      alert("Completed punch-ins must be a non-negative number")
      return
    }

    // Update the month
    setMonths(
      months.map((month) => {
        if (month.id === editMonthId) {
          return {
            id: editMonth, // Update ID if month changed
            month: monthDate,
            targetPoints,
            earnedPoints,
            rewards: validRewards.map((reward) => ({
              name: reward.name,
              points: Number(reward.points),
              claimed: (reward as any).claimed || false,
            })),
            completedEvents,
            completedPunchIns,
            imageUrl: editImageUrl || undefined,
            summary: editSummary.trim() || undefined, // Add summary
          }
        }
        return month
      }),
    )

    setIsEditMonthOpen(false)
  }

  // Delete a month
  const handleDeleteMonth = (id: string) => {
    if (confirm("Are you sure you want to delete this month?")) {
      setMonths(months.filter((month) => month.id !== id))
    }
  }

  // Remove the localStorage code since we're now using context

  // Get current month data for context sharing
  const getCurrentMonthData = () => {
    const now = new Date()
    return months.find(
      (month) => month.month.getFullYear() === now.getFullYear() && month.month.getMonth() === now.getMonth(),
    )
  }

  // Make current month data available to other components
  if (typeof window !== "undefined") {
    // Store current month data in localStorage for other components to access
    const currentMonthData = getCurrentMonthData()
    if (currentMonthData) {
      localStorage.setItem("currentMonthData", JSON.stringify(currentMonthData))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monthly Records</h2>
        <Dialog open={isAddMonthOpen} onOpenChange={setIsAddMonthOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Month
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Month</DialogTitle>
              <DialogDescription>Create a new month with target points and rewards.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input id="month" type="month" value={newMonth} onChange={(e) => setNewMonth(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetPoints">Target Points</Label>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetPoints"
                    type="number"
                    value={newTargetPoints}
                    onChange={(e) => setNewTargetPoints(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Month Image URL (optional)</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
                {newImageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden border h-32 bg-muted flex items-center justify-center">
                    <img
                      src={newImageUrl || "/placeholder.svg"}
                      alt="Month preview"
                      className="max-h-full max-w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=256"
                        alert("Image failed to load. Please check the URL.")
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Month Summary (optional)</Label>
                <textarea
                  id="summary"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter a summary or goals for this month..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Rewards</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={addReward}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Reward
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {newRewards.map((reward, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-6"
                        placeholder="Reward name"
                        value={reward.name}
                        onChange={(e) => updateRewardName(index, e.target.value)}
                      />
                      <Input
                        className="col-span-4"
                        type="number"
                        placeholder="Points"
                        value={reward.points}
                        onChange={(e) => updateRewardPoints(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeReward(index)}
                        disabled={newRewards.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMonthOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMonth}>Add Month</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Month Dialog */}
        <Dialog open={isEditMonthOpen} onOpenChange={setIsEditMonthOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Month</DialogTitle>
              <DialogDescription>Update month details and rewards.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editMonth">Month</Label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input id="editMonth" type="month" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editTargetPoints">Target Points</Label>
                  <Input
                    id="editTargetPoints"
                    type="number"
                    value={editTargetPoints}
                    onChange={(e) => setEditTargetPoints(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editEarnedPoints">Earned Points</Label>
                  <Input
                    id="editEarnedPoints"
                    type="number"
                    value={editEarnedPoints}
                    onChange={(e) => setEditEarnedPoints(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editImageUrl">Month Image URL (optional)</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editImageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                  />
                </div>
                {editImageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden border h-32 bg-muted flex items-center justify-center">
                    <img
                      src={editImageUrl || "/placeholder.svg"}
                      alt="Month preview"
                      className="max-h-full max-w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=256"
                        alert("Image failed to load. Please check the URL.")
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSummary">Month Summary (optional)</Label>
                <textarea
                  id="editSummary"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter a summary or goals for this month..."
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editCompletedEvents">Completed Events</Label>
                  <Input
                    id="editCompletedEvents"
                    type="number"
                    value={editCompletedEvents}
                    onChange={(e) => setEditCompletedEvents(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editCompletedPunchIns">Completed Punch-ins</Label>
                  <Input
                    id="editCompletedPunchIns"
                    type="number"
                    value={editCompletedPunchIns}
                    onChange={(e) => setEditCompletedPunchIns(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Rewards</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={addEditReward}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Reward
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {editRewards.map((reward, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-5"
                        placeholder="Reward name"
                        value={reward.name}
                        onChange={(e) => updateEditRewardName(index, e.target.value)}
                      />
                      <Input
                        className="col-span-3"
                        type="number"
                        placeholder="Points"
                        value={reward.points}
                        onChange={(e) => updateEditRewardPoints(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`col-span-2 h-8 ${(reward as any).claimed ? "bg-green-100 text-green-700 border-green-200" : ""}`}
                        onClick={() => toggleEditRewardClaimed(index)}
                      >
                        {(reward as any).claimed ? "Claimed" : "Unclaimed"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEditReward(index)}
                        disabled={editRewards.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMonthOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months
          .sort((a, b) => a.month.getTime() - b.month.getTime())
          .map((month) => {
            const progress = Math.min(100, (month.earnedPoints / month.targetPoints) * 100)
            const isCurrentMonth = isSameMonth(month.month, new Date())

            return (
              <Card key={month.id} className={isCurrentMonth ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {format(month.month, "MMMM yyyy")}
                      {isCurrentMonth && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(month.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteMonth(month.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {month.imageUrl && (
                  <div className="px-6 pb-2">
                    <div className="h-32 rounded-md overflow-hidden">
                      <img
                        src={month.imageUrl || "/placeholder.svg"}
                        alt={`${format(month.month, "MMMM yyyy")} theme`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Target</span>
                        </div>
                        <span className="font-medium">
                          {month.earnedPoints} / {month.targetPoints} points
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {month.summary && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">Summary</h3>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2" title={month.summary}>
                          {month.summary}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-medium">Rewards</h3>
                      </div>
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {month.rewards.map((reward, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-1.5 text-sm"
                          >
                            <div className="flex items-center gap-1.5">
                              <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs">{reward.name}</span>
                            </div>
                            <Badge
                              variant={reward.claimed ? "success" : "outline"}
                              className={
                                reward.claimed
                                  ? "text-xs bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700"
                                  : "text-xs"
                              }
                            >
                              {reward.points} pts
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex w-full flex-col space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4" />
                        <span>Completed Events</span>
                      </div>
                      <Badge variant="secondary">{month.completedEvents}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>Completed Punch-ins</span>
                      </div>
                      <Badge variant="secondary">{month.completedPunchIns}</Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
      </div>
    </div>
  )
}

