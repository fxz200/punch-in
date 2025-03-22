"use client"

import { useState } from "react"
import { Settings, Palette, Eye, EyeOff, Check } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useHabitTracker } from "./habit-tracker-context"
import { cn } from "@/lib/utils"
// Add imports for the radio group components
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CalendarDisplayMode } from "./habit-tracker-context"
import { Badge } from "@/components/ui/badge"

// Available color options
const colorOptions = [
  { name: "Blue", value: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Red", value: "bg-red-100 text-red-700 border-red-200" },
  { name: "Green", value: "bg-green-100 text-green-700 border-green-200" },
  { name: "Purple", value: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Amber", value: "bg-amber-100 text-amber-700 border-amber-200" },
  { name: "Indigo", value: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { name: "Orange", value: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Cyan", value: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { name: "Pink", value: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Emerald", value: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "Teal", value: "bg-teal-100 text-teal-700 border-teal-200" },
  { name: "Lime", value: "bg-lime-100 text-lime-700 border-lime-200" },
  { name: "Rose", value: "bg-rose-100 text-rose-700 border-rose-200" },
  { name: "Sky", value: "bg-sky-100 text-sky-700 border-sky-200" },
  { name: "Fuchsia", value: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
]

export function TaskVisibilitySettings() {
  const {
    punchInTasks,
    taskColors,
    setTaskColors,
    taskVisibility,
    setTaskVisibility,
    calendarDisplayMode,
    setCalendarDisplayMode,
  } = useHabitTracker()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"visibility" | "display">("visibility")

  // Toggle task visibility
  const toggleTaskVisibility = (taskName: string) => {
    setTaskVisibility({
      ...taskVisibility,
      [taskName]: !taskVisibility[taskName],
    })
  }

  // Update task color
  const updateTaskColor = (taskName: string, colorValue: string) => {
    setTaskColors({
      ...taskColors,
      [taskName]: colorValue,
    })
  }

  // Toggle all tasks visibility
  const toggleAllTasks = (visible: boolean) => {
    const newVisibility = { ...taskVisibility }
    punchInTasks.forEach((task) => {
      newVisibility[task.name] = visible
    })
    setTaskVisibility(newVisibility)
  }

  // Handle display mode change
  const handleDisplayModeChange = (value: string) => {
    setCalendarDisplayMode(value as CalendarDisplayMode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings className="h-3.5 w-3.5" />
          <span>Task Display</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Task Display Settings</DialogTitle>
          <DialogDescription>Customize how tasks appear in your calendar.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "visibility" | "display")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visibility">Task Visibility</TabsTrigger>
            <TabsTrigger value="display">Display Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="visibility" className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="text-sm font-medium">Visibility Controls</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleAllTasks(true)}>
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  Show All
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleAllTasks(false)}>
                  <EyeOff className="mr-1 h-3.5 w-3.5" />
                  Hide All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {punchInTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        id={`task-${task.id}`}
                        checked={taskVisibility[task.name] !== false}
                        onCheckedChange={() => toggleTaskVisibility(task.name)}
                      />
                      <div className="flex flex-col">
                        <Label
                          htmlFor={`task-${task.id}`}
                          className={cn(
                            "font-medium",
                            taskVisibility[task.name] === false && "text-muted-foreground line-through",
                          )}
                        >
                          {task.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">{task.points} points</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("h-7 gap-1", taskColors[task.name])}>
                          <Palette className="h-3.5 w-3.5" />
                          <span>Color</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
                        {colorOptions.map((color) => (
                          <DropdownMenuItem
                            key={color.name}
                            className={cn("flex items-center justify-between", color.value)}
                            onClick={() => updateTaskColor(task.name, color.value)}
                          >
                            <span>{color.name}</span>
                            {taskColors[task.name] === color.value && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm font-medium">Calendar Display Mode</div>

              <RadioGroup value={calendarDisplayMode} onValueChange={handleDisplayModeChange} className="space-y-4">
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="badges" id="badges" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="badges" className="font-medium">
                      Task Badges
                    </Label>
                    <p className="text-sm text-muted-foreground">Show task names with badges in the calendar</p>
                    <div className="mt-2 border rounded-md p-3 bg-muted/20">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs truncate justify-between font-normal bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <span className="truncate">push a commit</span>
                          <span className="ml-1 rounded-full bg-white/50 px-1 text-[10px]">×2</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs truncate justify-between font-normal bg-green-100 text-green-700 border-green-200"
                        >
                          <span className="truncate">code war &gt;5 kata</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="dots" id="dots" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="dots" className="font-medium">
                      Colored Dots
                    </Label>
                    <p className="text-sm text-muted-foreground">Show colored dots representing task completions</p>
                    <div className="mt-2 border rounded-md p-3 bg-muted/20">
                      <div className="flex flex-wrap gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

