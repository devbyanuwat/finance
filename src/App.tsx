import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-4xl font-bold">Money Manager</h1>
          <p className="text-muted-foreground">
            Personal finance management made simple
          </p>

          <div className="flex gap-4">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>

          {/* Test custom colors */}
          <div className="flex gap-2 mt-8">
            <span className="px-3 py-1 rounded-full bg-income text-white text-sm">
              Income
            </span>
            <span className="px-3 py-1 rounded-full bg-expense text-white text-sm">
              Expense
            </span>
            <span className="px-3 py-1 rounded-full bg-investment text-white text-sm">
              Investment
            </span>
            <span className="px-3 py-1 rounded-full bg-goal text-white text-sm">
              Goal
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
