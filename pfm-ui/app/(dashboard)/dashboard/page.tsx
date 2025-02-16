"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton'
import BonusIcon from '@/components/icon/yandexBonus.svg'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, TrendingUp, TrendingDown, ArrowRight, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { useRouter } from 'next/navigation'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import NotLoginModal from '@/components/ui/NotLoginModal'
import { GetBalance, GetBonus } from '@/api/GetBalanceAndBonus'

const lineChartData = [
  { name: "Jan", income: 65000, expenses: 45000 },
  { name: "Feb", income: 72000, expenses: 48000 },
  { name: "Mar", income: 68000, expenses: 42000 },
  { name: "Apr", income: 75000, expenses: 46000 },
  { name: "May", income: 82000, expenses: 50000 },
  { name: "Jun", income: 78000, expenses: 47000 },
];

const pieChartData = [
  { name: "Housing", value: 35 },
  { name: "Food", value: 20 },
  { name: "Transport", value: 15 },
  { name: "Entertainment", value: 10 },
  { name: "Others", value: 20 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const recentTransactions = [
  { id: 1, description: "Grocery Shopping", amount: -4500, date: "Today" },
  { id: 2, description: "Salary Deposit", amount: 150000, date: "Yesterday" },
  { id: 3, description: "Restaurant", amount: -2800, date: "2 days ago" },
];

export default function DashboardPage() {
	const { toast } = useToast()
	const [balance, setBalance] = useState(0)
	const [bonus, setBonus] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				await Promise.all([
					GetBalance(setBalance, toast),
					GetBonus(setBonus, toast),
				])
			} catch (error) {
				toast({
					title: 'Ошибка загрузки данных',
					description: 'Попробуйте обновить страницу',
					variant: 'destructive',
				})
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [])

  return (
		<>
			<NotLoginModal />
			<div className='space-y-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<h1 className='text-3xl font-bold'>Welcome back!</h1>
					<Button>
						<Plus className='mr-2 h-4 w-4' /> Add Transaction
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<Card className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-none'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Balance
							</CardTitle>
							<Wallet className='h-4 w-4 text-blue-500' />
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='space-y-2'>
									<Skeleton className='h-6 w-32' />
									<Skeleton className='h-4 w-24' />
								</div>
							) : (
								<>
									<div className='text-2xl font-bold'>
										₽{(balance || 0).toLocaleString('ru-RU')}
									</div>
									<p className='text-xs text-muted-foreground mt-1'>
										{/* Обновите динамический процент */}
										+20.1% с прошлого месяца
									</p>
								</>
							)}
						</CardContent>
					</Card>
					<Card className='bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-none'>
						<CardHeader>
							<CardTitle className='flex items-center justify-between'>
								Total Bonus
								<svg
									className='h-5 w-5 ml-3'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 48 48'
								>
									<defs>
										<linearGradient
											id='SVGID_1_'
											gradientUnits='userSpaceOnUse'
											x1='1.6566'
											y1='23.9284'
											x2='46.2069'
											y2='23.9284'
										>
											<stop offset='0' stopColor='#EA5961' />
											<stop offset='0.2916' stopColor='#BA5475' />
											<stop offset='0.6114' stopColor='#8C5088' />
											<stop offset='0.8582' stopColor='#704D95' />
											<stop offset='1' stopColor='#654C99' />
										</linearGradient>
									</defs>
									<path
										fill='none'
										stroke='url(#SVGID_1_)'
										strokeWidth='1.3358'
										strokeMiterlimit='10'
										d='M29.42,24.33l-3.89,12.26h-5.94l4.13-12.26H9.78l1.32-5.38h14.44l5.23-15.52c-2.15-0.72-4.45-1.1-6.83-1.1C12,2.32,2.32,12,2.32,23.93c0,11.93,9.67,21.6,21.6,21.6c11.8,0,21.38-9.46,21.6-21.2H29.42z'
									/>
									<defs>
										<linearGradient
											id='SVGID_00000013879612060185511730000011175489787274580666_'
											gradientUnits='userSpaceOnUse'
											x1='30.2185'
											y1='12.0982'
											x2='45.7982'
											y2='12.0982'
										>
											<stop offset='0' stopColor='#EA5961' />
											<stop offset='0.2916' stopColor='#BA5475' />
											<stop offset='0.6114' stopColor='#8C5088' />
											<stop offset='0.8582' stopColor='#704D95' />
											<stop offset='1' stopColor='#654C99' />
										</linearGradient>
									</defs>
									<path
										fill='none'
										stroke='url(#SVGID_00000013879612060185511730000011175489787274580666_)'
										strokeWidth='1.3358'
										strokeMiterlimit='10'
										d='M31.13,18.95h13.82c-1.32-5.61-4.84-10.38-9.59-13.35L31.13,18.95z'
									/>
								</svg>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='space-y-2'>
									<Skeleton className='h-6 w-32' />
									<Skeleton className='h-4 w-24' />
								</div>
							) : (
								<>
									<div className='text-2xl font-bold'>
										{(bonus || 0).toLocaleString('ru-RU')}
									</div>
									<p className='text-xs text-muted-foreground mt-1'>
										+20.1% с прошлого месяца
									</p>
								</>
							)}
						</CardContent>
					</Card>
					<Card className='bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-none'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium'>
								Monthly Income
							</CardTitle>
							<PiggyBank className='h-4 w-4 text-emerald-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>₽78,000</div>
							<p className='text-xs text-muted-foreground mt-1'>
								+4.3% from last month
							</p>
						</CardContent>
					</Card>
					<Card className='bg-gradient-to-br from-red-500/10 to-orange-500/10 border-none'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium'>
								Monthly Expenses
							</CardTitle>
							<CreditCard className='h-4 w-4 text-red-500' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>₽47,000</div>
							<p className='text-xs text-muted-foreground mt-1'>
								-2.5% from last month
							</p>
						</CardContent>
					</Card>
				</div>

				<div className='grid gap-6 md:grid-cols-2'>
					<Card>
						<CardHeader>
							<CardTitle>Recent Transactions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{recentTransactions.map(transaction => (
									<div
										key={transaction.id}
										className='flex items-center justify-between p-4 rounded-lg bg-accent/50'
									>
										<div className='space-y-1'>
											<p className='font-medium'>{transaction.description}</p>
											<p className='text-sm text-muted-foreground'>
												{transaction.date}
											</p>
										</div>
										<p
											className={`font-medium ${
												transaction.amount > 0
													? 'text-emerald-500'
													: 'text-red-500'
											}`}
										>
											₽{Math.abs(transaction.amount).toLocaleString()}
										</p>
									</div>
								))}
								<Button variant='outline' className='w-full' asChild>
									<Link href='/dashboard/transactions'>
										View All Transactions
										<ArrowRight className='ml-2 h-4 w-4' />
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Expense Distribution</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='h-[300px]'>
								<ResponsiveContainer width='100%' height='100%'>
									<PieChart>
										<Pie
											data={pieChartData}
											cx='50%'
											cy='50%'
											labelLine={false}
											outerRadius={100}
											fill='#8884d8'
											dataKey='value'
										>
											{pieChartData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Income vs Expenses</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={lineChartData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='name' />
									<YAxis />
									<Tooltip />
									<Line
										type='monotone'
										dataKey='income'
										stroke='hsl(var(--chart-1))'
										strokeWidth={2}
									/>
									<Line
										type='monotone'
										dataKey='expenses'
										stroke='hsl(var(--chart-2))'
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}