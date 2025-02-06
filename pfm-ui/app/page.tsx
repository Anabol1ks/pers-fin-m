import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">FinTrack</h1>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Take Control of Your Financial Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Track expenses, analyze spending patterns, and make informed financial decisions with our comprehensive analysis tools.
            </p>
            <Button size="lg" asChild>
              <Link href="/register" className="inline-flex items-center">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Transaction Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Easily manage and categorize your income and expenses
              </p>
            </Card>
            <Card className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Gain insights with detailed financial reports and visualizations
              </p>
            </Card>
            <Card className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Category Management</h3>
              <p className="text-sm text-muted-foreground">
                Organize transactions with custom categories and color coding
              </p>
            </Card>
            <Card className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">
                Your financial data is protected with industry-standard security
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}