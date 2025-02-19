'use client'

import { useState } from 'react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from 'recharts'
import { Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'

// Sample data - would be replaced with real data in production
const balanceHistory = [
	{ date: '2024-01', balance: 180000, bonus: 1200 },
	{ date: '2024-02', balance: 195000, bonus: 1500 },
	{ date: '2024-03', balance: 245000, bonus: 2345 },
]

const monthlyData = [
	{ month: 'Jan', income: 150000, expenses: 120000, savings: 30000 },
	{ month: 'Feb', income: 165000, expenses: 125000, savings: 40000 },
	{ month: 'Mar', income: 180000, expenses: 130000, savings: 50000 },
]

const categoryData = [
	{ category: 'Housing', amount: 45000 },
	{ category: 'Food', amount: 25000 },
	{ category: 'Transport', amount: 15000 },
	{ category: 'Entertainment', amount: 20000 },
	{ category: 'Utilities', amount: 12000 },
	{ category: 'Shopping', amount: 13000 },
]

export default function AnalyticsPage() {
	const [dateRange, setDateRange] = useState({
		from: addDays(new Date(), -30),
		to: new Date(),
	})
	const [timeframe, setTimeframe] = useState('monthly')

	const calculateGrowth = (current: number, previous: number) => {
		return ((current - previous) / previous) * 100
	}

	const currentBalance = balanceHistory[balanceHistory.length - 1].balance
	const previousBalance = balanceHistory[balanceHistory.length - 2].balance
	const balanceGrowth = calculateGrowth(currentBalance, previousBalance)

	const currentBonus = balanceHistory[balanceHistory.length - 1].bonus
	const previousBonus = balanceHistory[balanceHistory.length - 2].bonus
	const bonusGrowth = calculateGrowth(currentBonus, previousBonus)

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
				<h1 className='text-3xl font-bold'>Analytics</h1>
				<div className='flex flex-wrap gap-4'>
					<DatePickerWithRange date={dateRange} setDate={setDateRange} />
					<Select value={timeframe} onValueChange={setTimeframe}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select timeframe' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='daily'>Daily</SelectItem>
							<SelectItem value='weekly'>Weekly</SelectItem>
							<SelectItem value='monthly'>Monthly</SelectItem>
							<SelectItem value='yearly'>Yearly</SelectItem>
						</SelectContent>
					</Select>
					<Button variant='outline'>
						<Download className='mr-2 h-4 w-4' />
						Export Report
					</Button>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<Card className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-none'>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							Total Balance
							{balanceGrowth > 0 ? (
								<TrendingUp className='h-4 w-4 text-emerald-500' />
							) : (
								<TrendingDown className='h-4 w-4 text-red-500' />
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold mb-2'>
							₽{currentBalance.toLocaleString()}
						</div>
						<p
							className={`text-sm ${
								balanceGrowth > 0 ? 'text-emerald-500' : 'text-red-500'
							}`}
						>
							{balanceGrowth > 0 ? '+' : ''}
							{balanceGrowth.toFixed(1)}% from previous month
						</p>
					</CardContent>
				</Card>

				<Card className='bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-none'>
					<CardHeader>
						<CardTitle className='flex items-center justify-between'>
							Total Bonus Points
							{bonusGrowth > 0 ? (
								<TrendingUp className='h-4 w-4 text-emerald-500' />
							) : (
								<TrendingDown className='h-4 w-4 text-red-500' />
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold mb-2'>
							{currentBonus.toLocaleString()}
						</div>
						<p
							className={`text-sm ${
								bonusGrowth > 0 ? 'text-emerald-500' : 'text-red-500'
							}`}
						>
							{bonusGrowth > 0 ? '+' : ''}
							{bonusGrowth.toFixed(1)}% from previous month
						</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-6'>
				<div className='grid gap-6 md:grid-cols-2'>
					<Card>
						<CardHeader>
							<CardTitle>Monthly Overview</CardTitle>
							<CardDescription>
								Income, expenses, and savings analysis
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={monthlyData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='month' />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey='income'
										fill='hsl(var(--chart-1))'
										name='Income'
									/>
									<Bar
										dataKey='expenses'
										fill='hsl(var(--chart-2))'
										name='Expenses'
									/>
									<Bar
										dataKey='savings'
										fill='hsl(var(--chart-3))'
										name='Savings'
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Spending by Category</CardTitle>
							<CardDescription>
								Distribution of expenses across categories
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={categoryData} layout='vertical'>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis type='number' />
									<YAxis dataKey='category' type='category' />
									<Tooltip />
									<Bar dataKey='amount' fill='hsl(var(--chart-4))' />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
