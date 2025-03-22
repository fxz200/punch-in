"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Gift, Target, Plus, Calendar, FileText } from "lucide-react"
import { useHabitTracker } from "./habit-tracker-context"
import { format, isSameMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MonthlyOverview() {
  const { punchInTasks, getTaskCountForMonth, displayedMonth, getMonthDataForDate, months, setMonths } =
    useHabitTracker()

  // State for the add month dialog
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false)
  const [newTargetPoints, setNewTargetPoints] = useState("200")
  const [newRewards, setNewRewards] = useState<{ name: string; points: string | number; claimed?: boolean }[]>([
    { name: "New Book", points: "150" },
    { name: "Movie Night", points: "200" },
  ])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newSummary, setNewSummary] = useState("")

  // Get month data for the displayed month
  const monthData = getMonthDataForDate(displayedMonth)
  const isCurrentMonth = isSameMonth(displayedMonth, new Date())

  // Format the displayed month
  const formattedMonth = format(displayedMonth, "MMMM yyyy")

  // Calculate monthly score for the displayed month
  const calculateMonthlyScore = () => {
    if (!monthData) return 0
    return monthData.earnedPoints
  }

  // Get data for the displayed month
  const currentScore = calculateMonthlyScore()
  const targetScore = monthData?.targetPoints || 200
  const progress = Math.min(100, (currentScore / targetScore) * 100)
  const rewards = monthData?.rewards || []

  // Function to add a new month
  const handleAddMonth = () => {
    // Validate rewards
    const validRewards = newRewards.filter(
      (reward) => reward.name.trim() !== "" && reward.points !== "" && !isNaN(Number(reward.points)),
    )

    if (validRewards.length === 0) {
      alert("Please add at least one valid reward")
      return
    }

    const newMonthCard = {
      id: format(displayedMonth, "yyyy-MM"),
      month: new Date(displayedMonth),
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
    setNewTargetPoints("200")
    setNewRewards([
      { name: "New Book", points: "150" },
      { name: "Movie Night", points: "200" },
    ])
    setNewImageUrl("")
    setNewSummary("")
  }

  // Add a new reward input
  const addReward = () => {
    setNewRewards([...newRewards, { name: "", points: "" }])
  }

  // Remove a reward input
  const removeReward = (index: number) => {
    if (newRewards.length <= 1) return // Keep at least one reward
    const updatedRewards = [...newRewards]
    updatedRewards.splice(index, 1)
    setNewRewards(updatedRewards)
  }

  // Update reward name
  const updateRewardName = (index: number, name: string) => {
    const updatedRewards = [...newRewards]
    updatedRewards[index].name = name
    setNewRewards(updatedRewards)
  }

  // Update reward points
  const updateRewardPoints = (index: number, points: string) => {
    const updatedRewards = [...newRewards]
    updatedRewards[index].points = points
    setNewRewards(updatedRewards)
  }

  // If no month data exists, show a prompt to create one
  if (!monthData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Monthly Overview</h2>
          <Badge variant="outline" className="text-sm font-medium">
            {formattedMonth}
          </Badge>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-8 border rounded-md border-dashed">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-medium">No data for {formattedMonth}</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a month card to track your goals and rewards</p>
          </div>

          <Dialog open={isAddMonthOpen} onOpenChange={setIsAddMonthOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Create Month Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Month: {formattedMonth}</DialogTitle>
                <DialogDescription>Create a new month with target points and rewards.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetPoints">Target Points</Label>
                  <Input
                    id="targetPoints"
                    type="number"
                    value={newTargetPoints}
                    onChange={(e) => setNewTargetPoints(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">Month Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
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
                          className="col-span-7"
                          placeholder="Reward name"
                          value={reward.name}
                          onChange={(e) => updateRewardName(index, e.target.value)}
                        />
                        <Input
                          className="col-span-3"
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
                          <span>×</span>
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
                <Button onClick={handleAddMonth}>Create Month</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  // If month data exists, show the regular overview
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Monthly Overview</h2>
        <Badge
          variant="outline"
          className={`text-sm font-medium ${isCurrentMonth ? "bg-primary/10 text-primary" : ""}`}
        >
          {formattedMonth}
          {isCurrentMonth && <span className="ml-1">(Current)</span>}
        </Badge>
      </div>

      {/* Month Image */}
      {monthData?.imageUrl && (
        <div className="rounded-md overflow-hidden h-32 mb-4">
          <img
            src={monthData.imageUrl || "/placeholder.svg"}
            alt={`${formattedMonth} theme`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Monthly Target</span>
          </div>
          <span className="font-medium">
            {currentScore} / {targetScore} points
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {monthData?.summary && (
        <div className="space-y-2 my-4">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Summary</h3>
          </div>
          <div className="text-sm rounded-lg border p-3 bg-muted/10">{monthData.summary}</div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="font-medium">Rewards</h3>
        </div>

        <div className="space-y-2">
          {rewards.map((reward, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-muted-foreground" />
                <span>{reward.name}</span>
              </div>
              <Badge
                variant={reward.claimed ? "success" : "outline"}
                className={reward.claimed ? "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700" : ""}
              >
                {reward.points} pts
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

