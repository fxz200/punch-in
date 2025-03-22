import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { MajorEventsList } from "@/components/major-events-list"
import { MonthlyOverview } from "@/components/monthly-overview"
import { PunchInList } from "@/components/punch-in-list"
import { CalendarView } from "@/components/calendar-view"
import { MonthlyView } from "@/components/monthly-view"
import { StatisticsView } from "@/components/statistics-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { HabitTrackerProvider } from "@/components/habit-tracker-context"

export default function HabitTracker() {
  return (
    <HabitTrackerProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <h1 className="text-2xl font-bold tracking-tight">Habit Tracker</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <CalendarDateRangePicker />
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <Tabs defaultValue="daily">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="daily">Daily View</TabsTrigger>
                <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="daily" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1">
                  <CardContent className="p-6">
                    <MonthlyOverview />
                  </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2">
                  <CardContent className="p-6">
                    <CalendarView />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="h-[500px]">
                  <CardContent className="p-6 h-full">
                    <PunchInList />
                  </CardContent>
                </Card>
                <Card className="h-[500px]">
                  <CardContent className="p-6 h-full">
                    <MajorEventsList />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <MonthlyView />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <StatisticsView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </HabitTrackerProvider>
  )
}

