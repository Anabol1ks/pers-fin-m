'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Filter } from 'lucide-react'
import NotLoginModal from '@/components/ui/NotLoginModal'
import { LoadCategories } from '@/api/LoadCategories'
import { ru } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/DatePick'
import axios from 'axios'
import Cookies from 'js-cookie'

const transactionsData = [
	{
		id: 1,
		Date: '2024-03-20',
		Category: 1, // id категории
		amount: -45000,
		description: 'Monthly Rent',
	},
	{
		id: 2,
		Date: '2024-03-19',
		Category: 5, // id категории
		amount: 150000,
		description: 'Monthly Salary',
	},
	{
		id: 3,
		Date: '2024-03-18',
		Category: 2, // id категории
		amount: -2500,
		description: 'Grocery Shopping',
	},
]

export default function TransactionsPage() {
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [categories, setCategories] = useState([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(true)
	const [transactions, setTransactions] = useState([])

	// Состояние для новой транзакции
	const [newTransaction, setNewTransaction] = useState({
		Amount: null as number | null,
		BonusChange: null as number | null,
		BonusType: null as 'income' | 'expense' | null,
		Currency: 'RUB',
		Date: new Date().toISOString(),
		Title: '',
		Description: '',
		Category: null as number | null,
		Type: null as 'income' | 'expense' | null,
	})

	// Состояние для DatePicker
	const [date, setDate] = useState<Date>(new Date())

	const handleAddTransactions = async () => {
		// Простая валидация
		if (!newTransaction.Amount) {
			toast({
				title: 'Ошибка',
				description: 'Сумма не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		if (!newTransaction.Title) {
			toast({
				title: 'Ошибка',
				description: 'Название не может быть пустым',
				variant: 'destructive',
			})
			return
		}
		if (!newTransaction.Category) {
			toast({
				title: 'Ошибка',
				description: 'Категория не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		if (!newTransaction.Type) {
			toast({
				title: 'Ошибка',
				description: 'Тип транзакции не может быть пустым',
				variant: 'destructive',
			})
			return
		}
		if (!newTransaction.Date) {
			toast({
				title: 'Ошибка',
				description: 'Дата не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/transactions`,
				newTransaction,
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('token')}`,
					},
				}
			)
			if (response.status === 201) {
				setIsLoading(true)
				toast({
					title: 'Успех',
					description: 'Транзакция успешно добавлена',
				})
				setIsDialogOpen(false)
			} else {
				toast({
					title: 'Ошибка',
					description:
						response.data.error || 'Произошла ошибка при добавлении транзакции',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Ошибка при добавлении транзакции:', error)
			toast({
				title: 'Ошибка',
				description: 'Произошла ошибка при добавлении транзакции',
				variant: 'destructive',
			})
		}
	}

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/transactions`,
					{
						headers: {
							Authorization: `Bearer ${Cookies.get('token')}`,
						},
					}
				)
				if (response.status === 200) {
					setTransactions(response.data)
					console.log(response.data)
					return response.data
				} else {
					toast({
						title: 'Ошибка',
						description: 'Не удалось загрузить транзакции',
						variant: 'destructive',
					})
					return []
				}
			} catch (error) {
				console.error('Ошибка при загрузке транзакций:', error)
				toast({
					title: 'Ошибка',
					description: 'Не удалось загрузить транзакции',
					variant: 'destructive',
				})
				return []
			}
		}
		loadTransactions()
	}, [isLoading])

	useEffect(() => {
		// При открытии диалога устанавливаем текущую дату
		if (isDialogOpen) {
			setDate(new Date())
		}
	}, [isDialogOpen])

	useEffect(() => {
		// Загружаем категории при монтировании компонента
		LoadCategories(setCategories, toast)
	}, [])

	return (
		<>
			<NotLoginModal />
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<h1 className='text-3xl font-bold'>Transactions</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className='mr-2 h-4 w-4' /> Новая транзакция
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Новая транзакция</DialogTitle>
								<DialogDescription>
									Добавление новой транзакции.
								</DialogDescription>
							</DialogHeader>
							<div className='grid gap-4 py-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Название</Label>
									<Input
										id='name'
										value={newTransaction.Title}
										onChange={e =>
											setNewTransaction({
												...newTransaction,
												Title: e.target.value,
											})
										}
										placeholder='Название транзакции'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='desc'>Описание</Label>
									<Input
										id='desc'
										value={newTransaction.Description}
										onChange={e =>
											setNewTransaction({
												...newTransaction,
												Description: e.target.value,
											})
										}
										placeholder='Описание транзакции'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='amount'>Сумма</Label>
									<div className='flex items-center gap-2'>
										<Input
											id='amount'
											type='text'
											value={
												newTransaction.Amount === null
													? ''
													: newTransaction.Amount
											}
											onChange={e => {
												const valueStr = e.target.value.trim()
												if (!/^-?\d*\.?\d*$/.test(valueStr)) return
												const value =
													valueStr === '' ? null : parseFloat(valueStr)
												setNewTransaction({
													...newTransaction,
													Amount: value === 0 ? null : value,
												})
											}}
											placeholder='1000'
											className='flex-1'
										/>
										<Select
											onValueChange={value =>
												setNewTransaction({
													...newTransaction,
													Currency: value,
												})
											}
											value={newTransaction.Currency}
										>
											<SelectTrigger className='w-[80px]'>
												<SelectValue placeholder='RUB' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='RUB'>RUB</SelectItem>
												<SelectItem value='USD'>USD</SelectItem>
												<SelectItem value='EUR'>EUR</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<div>
										<Label htmlFor='category'>Категория</Label>
										<Select
											onValueChange={value =>
												setNewTransaction({
													...newTransaction,
													Category: parseInt(value, 10),
												})
											}
										>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Выберите категорию' />
											</SelectTrigger>
											<SelectContent>
												{categories.length > 0 ? (
													categories.map(category => (
														<SelectItem
															key={category.ID}
															value={String(category.ID)}
														>
															{category.Name}
														</SelectItem>
													))
												) : (
													<SelectItem value='0'>Нет категорий</SelectItem>
												)}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='type'>Тип</Label>
										<Select
											onValueChange={(value: 'income' | 'expense') =>
												setNewTransaction({ ...newTransaction, Type: value })
											}
											value={newTransaction.Type ?? ''}
										>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Выберите тип' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='income'>Доход</SelectItem>
												<SelectItem value='expense'>Расход</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								{/* Блок с датой и бонусами */}
								<div className='grid gap-2'>
									<div className='flex gap-2'>
										<div>
											<Label htmlFor='date'>Дата</Label>
											<DatePicker
												date={date}
												setDate={newDate => {
													setDate(newDate)
													setNewTransaction({
														...newTransaction,
														Date: newDate ? newDate.toISOString() : '',
													})
												}}
											/>
										</div>
										<div>
											<Label htmlFor='bonus'>Бонусы</Label>
											<div className='flex items-center gap-2'>
												<Input
													id='bonus'
													type='text'
													value={
														newTransaction.BonusChange === null
															? ''
															: newTransaction.BonusChange
													}
													onChange={e => {
														const valueStr = e.target.value.trim()
														if (!/^-?\d*\.?\d*$/.test(valueStr)) return
														const value =
															valueStr === '' ? null : parseFloat(valueStr)
														setNewTransaction({
															...newTransaction,
															BonusChange: value === 0 ? null : value,
															BonusType:
																value === 0 ? null : newTransaction.BonusType,
														})
													}}
													placeholder='0'
													className='flex-1'
												/>
												<Select
													onValueChange={value =>
														setNewTransaction({
															...newTransaction,
															BonusType:
																newTransaction.BonusChange === null
																	? null
																	: value,
														})
													}
													value={newTransaction.BonusType ?? ''}
												>
													<SelectTrigger className='w-[80px]'>
														<SelectValue placeholder='Тип' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='income'>+</SelectItem>
														<SelectItem value='expense'>-</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant='outline'
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleAddTransactions}>
									Add Transactions
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Transaction History</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col md:flex-row gap-4 mb-6'>
							<div className='relative flex-1'>
								<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search transactions...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-9'
								/>
							</div>
							<div className='flex gap-4'>
								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}
								>
									<SelectTrigger className='w-[180px]'>
										<SelectValue placeholder='Category' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Categories</SelectItem>
										{categories.map(category => (
											<SelectItem key={category.ID} value={category.Name}>
												{category.Name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button variant='outline'>
									<Filter className='mr-2 h-4 w-4' /> Filters
								</Button>
							</div>
						</div>

						<div className='rounded-md border'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Bonus</TableHead>
										<TableHead className='text-right'>Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.map(transaction => {
										// Находим объект категории по id, хранящемуся в transaction.Category
										const categoryObj = categories.find(
											cat => cat.ID === transaction.Category
										)
										return (
											<TableRow key={transaction.ID}>
												<TableCell>
													{format(new Date(transaction.Date), 'd MMMM yyyy', {
														locale: ru,
													})}
												</TableCell>

												<TableCell>
													{categoryObj
														? categoryObj.Name
														: 'Неизвестная категория'}
												</TableCell>
												<TableCell>
													{' '}
													{transaction.Description &&
													transaction.Description.length > 15
														? transaction.Description.slice(0, 15) + '...'
														: transaction.Description}
												</TableCell>
												<TableCell
													className={`${
														transaction.BonusChange === 0
															? ''
															: transaction.BonusType === 'expense'
															? 'text-red-500'
															: transaction.BonusType === 'income'
															? 'text-emerald-500'
															: ''
													}`}
												>
													{transaction.BonusChange === 0
														? '-'
														: transaction.BonusChange}
												</TableCell>
												<TableCell
													className={`text-right ${
														transaction.Type === 'expense'
															? 'text-red-500'
															: transaction.Type === 'income'
															? 'text-emerald-500'
															: ''
													}`}
												>
													₽{Math.abs(transaction.Amount).toLocaleString()}
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
