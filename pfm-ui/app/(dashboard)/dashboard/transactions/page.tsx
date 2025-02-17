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
import { DialogClose } from '@radix-ui/react-dialog'

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
	const [isDialogInfoOpen, setIsDialogInfoOpen] = useState(false)
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

	const [transactionToUpdate, setTransactionToUpdate] = useState({
		Amount: null as number | null,
		BonusChange: null as number | null,
		BonusType: null as 'income' | 'expense' | null,
		Currency: 'RUB',
		Date: new Date().toISOString(),
		Title: '',
		Description: '',
		Category: null as number | null,
		Type: null as 'income' | 'expense' | null,
		ID: null as number | null,
	})

	const handleUpdateTransaction = async () => {
		if (!transactionToUpdate.Amount) {
			toast({
				title: 'Ошибка',
				description: 'Сумма не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		if (!transactionToUpdate.Title) {
			toast({
				title: 'Ошибка',
				description: 'Название не может быть пустым',
				variant: 'destructive',
			})
			return
		}
		if (!transactionToUpdate.Category) {
			toast({
				title: 'Ошибка',
				description: 'Категория не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		if (!transactionToUpdate.Type) {
			toast({
				title: 'Ошибка',
				description: 'Тип транзакции не может быть пустым',
				variant: 'destructive',
			})
			return
		}
		if (!transactionToUpdate.Date) {
			toast({
				title: 'Ошибка',
				description: 'Дата не может быть пустой',
				variant: 'destructive',
			})
			return
		}
		try {
			const response = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionToUpdate.ID}`,
				{
					// Приводим данные к формату API
					amount: transactionToUpdate.Amount,
					title: transactionToUpdate.Title,
					description: transactionToUpdate.Description,
					category: transactionToUpdate.Category,
					type: transactionToUpdate.Type,
					date: transactionToUpdate.Date,
					currency: transactionToUpdate.Currency,
					bonusChange: transactionToUpdate.BonusChange,
					typeBonus: transactionToUpdate.BonusType,
				},
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('token')}`,
					},
				}
			)
			if (response.status === 200) {
				setIsDialogInfoOpen(false)
				toast({
					title: 'Успешно',
					description: 'Транзакция успешно обновлена',
					variant: 'default',
				})
				setIsLoading(true)
			} else {
				toast({
					title: 'Ошибка',
					description:
						response.data.error || 'Ошибка при обновлении транзакции',
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Ошибка',
				description: 'Не удалось обновить транзакцию',
				variant: 'destructive',
			})
		}
		setIsLoading(true)
		setIsDialogOpen(false)
		setTransactionToUpdate({
			Amount: null,
			BonusChange: null,
			BonusType: null,
			Currency: 'RUB',
			Date: new Date().toISOString(),
			Title: '',
			Description: '',
			Category: null,
			Type: null,
			ID: null,
		})
	}

	// Состояние для DatePicker
	const [date, setDate] = useState<Date>(new Date())

	const [amountTouched, setAmountTouched] = useState(false)

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
				{
					amount: newTransaction.Amount,
					title: newTransaction.Title,
					description: newTransaction.Description,
					category: newTransaction.Category,
					type: newTransaction.Type,
					date: newTransaction.Date,
					currency: newTransaction.Currency,
					bonusChange: newTransaction.BonusChange,
					typeBonus: newTransaction.BonusType, // Make sure this field name matches exactly
				},
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

	const [deleteTransactionId, setDeleteTransactionId] = useState(null)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const handleDeleteTransaction = async () => {
		if (!deleteTransactionId) {
			toast({
				title: 'Ошибка',
				description: 'Не выбрана транзакция для удаления',
				variant: 'destructive',
			})
			return
		}
		 try {
				const response = await axios.delete(
					`${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionToUpdate.ID}`,
					{
						headers: {
							Authorization: `Bearer ${Cookies.get('token')}`,
						},
					}
				)
				if (response.status === 200) {
					setIsLoading(true)
					setIsDialogInfoOpen(false)
					toast({
						title: 'Успех',
						description: 'Транзакция успешно удалена',
					})
				} else {
					toast({
						title: 'Ошибка',
						description:
							response.data.error || 'Произошла ошибка при удалении транзакции',
						variant: 'destructive',
					})
				}
			} catch (error) {
				console.error('Ошибка при удалении транзакции:', error)
				toast({
					title: 'Ошибка',
					description: 'Произошла ошибка при удалении транзакции',
					variant: 'destructive',
				})
			}
		setIsDeleteDialogOpen(false)
		setIsDialogInfoOpen(false)
		setTransactionToUpdate({
			Amount: null,
			BonusChange: null,
			BonusType: null,
			Currency: 'RUB',
			Date: new Date().toISOString(),
			Title: '',
			Description: '',
			Category: null,
			Type: null,
			ID: null,
		})
		setDeleteTransactionId(null)
	}


	const [advancedFilters, setAdvancedFilters] = useState({
		description: '',
		amount: null as number | null,
		bonusChange: null as number | null,
		date: null as Date | null,
		type: 'all' as 'income' | 'expense' | 'all',
		bonusType: 'all' as 'income' | 'expense' | 'all',
	})

	// Локальные состояния для диалога фильтров
	const [localDescription, setLocalDescription] = useState('')
	const [localAmount, setLocalAmount] = useState<number | null>(null)
	const [localBonusChange, setLocalBonusChange] = useState<number | null>(null)
	const [localDate, setLocalDate] = useState<Date | null>(null)
	const [localType, setLocalType] = useState<'all' | 'income' | 'expense'>(
		'all'
	)
	const [localBonusType, setLocalBonusType] = useState<
		'all' | 'income' | 'expense'
	>('all')

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const params = {
					title: searchTerm || undefined,
					description: advancedFilters.description || undefined,
					amount: advancedFilters.amount || undefined,
					bonusChange: advancedFilters.bonusChange || undefined,
					date: advancedFilters.date
						? new Date(advancedFilters.date).toISOString()
						: undefined,
					category: categoryFilter !== 'all' ? categoryFilter : undefined,
					type:
						advancedFilters.type !== 'all' ? advancedFilters.type : undefined,
					typeBonus:
						advancedFilters.bonusType !== 'all'
							? advancedFilters.bonusType
							: undefined,
				}

				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/transactions/search`,
					{
						params,
						headers: { Authorization: `Bearer ${Cookies.get('token')}` },
					}
				)
				setTransactions(response.data)
			} catch (error) {
				console.error('Ошибка при загрузке транзакций:', error)
				toast({
					title: 'Ошибка',
					description: 'Не удалось загрузить транзакции',
					variant: 'destructive',
				})
			}
		}
		loadTransactions()
	}, [searchTerm, categoryFilter, advancedFilters, isLoading])

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

	const handleTransactionClick = (transaction: any) => {
		// Make sure we're setting the correct ID from the transaction
		setTransactionToUpdate({
			Amount: transaction.Amount,
			BonusChange: transaction.BonusChange,
			BonusType: transaction.BonusType,
			Currency: transaction.Currency,
			Date: transaction.Date,
			Title: transaction.Title,
			Description: transaction.Description,
			Category: transaction.Category,
			Type: transaction.Type,
			ID: transaction.ID, // This needs to be the correct ID from your transaction
		})
		setIsDialogInfoOpen(true)
	}

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
											type='number'
											value={
												newTransaction.Amount === null
													? ''
													: newTransaction.Amount
											}
											placeholder='1000'
											onChange={e => {
												const valueStr = e.target.value.trim()

												// Не допускаем, чтобы первым символом была точка
												if (valueStr.startsWith('.')) return

												// Проверка по регулярному выражению:
												// - только цифры, опционально точка и максимум две цифры после неё
												// - отрицательные числа (с "-") тут не пройдут
												if (!/^\d*\.?\d{0,2}$/.test(valueStr)) return

												// Преобразуем строку в число (если поле пустое – null)
												const value =
													valueStr === '' ? null : parseFloat(valueStr)

												// Если значение равно 0, тоже считаем его как отсутствие значения (null)
												setNewTransaction({
													...newTransaction,
													Amount: value === 0 ? null : value,
												})
											}}
											onKeyDown={e => {
												if (e.key === '-' || e.key === 'e') {
													e.preventDefault()
												}
											}}
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
					<Dialog open={isDialogInfoOpen} onOpenChange={setIsDialogInfoOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ваша транзакция</DialogTitle>
								<DialogDescription>
									Информация о вашей транзакции.
								</DialogDescription>
							</DialogHeader>
							<div className='grid gap-4 py-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Название</Label>
									<Input
										id='name'
										value={transactionToUpdate.Title}
										onChange={e =>
											setTransactionToUpdate({
												...transactionToUpdate,
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
										value={transactionToUpdate.Description}
										onChange={e =>
											setTransactionToUpdate({
												...transactionToUpdate,
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
											type='number'
											value={
												transactionToUpdate.Amount === null
													? ''
													: transactionToUpdate.Amount
											}
											onChange={e => {
												const valueStr = e.target.value.trim()
												if (valueStr.startsWith('.')) return

												// Проверка по регулярному выражению:
												// - только цифры, опционально точка и максимум две цифры после неё
												// - отрицательные числа (с "-") тут не пройдут
												if (!/^\d*\.?\d{0,2}$/.test(valueStr)) return

												// Преобразуем строку в число (если поле пустое – null)
												const value =
													valueStr === '' ? null : parseFloat(valueStr)
												setTransactionToUpdate({
													...transactionToUpdate,
													Amount: value === 0 ? null : value,
												})
											}}
											onKeyDown={e => {
												if (e.key === '-' || e.key === 'e') {
													e.preventDefault()
												}
											}}
											placeholder='1000'
											className='flex-1'
										/>
										<Select
											onValueChange={value =>
												setTransactionToUpdate({
													...transactionToUpdate,
													Currency: value,
												})
											}
											value={transactionToUpdate.Currency}
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
												setTransactionToUpdate({
													...transactionToUpdate,
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
												setTransactionToUpdate({
													...transactionToUpdate,
													Type: value,
												})
											}
											value={transactionToUpdate.Type ?? ''}
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
												date={new Date(transactionToUpdate.Date)} // Преобразуем строку в Date
												setDate={newDate => {
													setTransactionToUpdate({
														...transactionToUpdate,
														Date: newDate
															? newDate.toISOString()
															: new Date().toISOString(),
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
														transactionToUpdate.BonusChange === null
															? ''
															: transactionToUpdate.BonusChange
													}
													onChange={e => {
														const valueStr = e.target.value.trim()
														if (!/^-?\d*\.?\d*$/.test(valueStr)) return
														const value =
															valueStr === '' ? null : parseFloat(valueStr)
														setTransactionToUpdate({
															...transactionToUpdate,
															BonusChange: value,
															BonusType:
																value === 0
																	? null
																	: transactionToUpdate.BonusType,
														})
													}}
													placeholder='0'
													className='flex-1'
												/>
												<Select
													onValueChange={value =>
														setTransactionToUpdate({
															...transactionToUpdate,
															BonusType:
																transactionToUpdate.BonusChange === null
																	? null
																	: value,
														})
													}
													value={transactionToUpdate.BonusType ?? ''}
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
									variant='destructive'
									onClick={() => {
										setDeleteTransactionId(transactionToUpdate.ID)
										setIsDeleteDialogOpen(true)
									}}
								>
									Удалить
								</Button>
								<Button onClick={handleUpdateTransaction}>Сохранить</Button>
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
									<SelectTrigger>
										<SelectValue placeholder='Категория' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>Все категории</SelectItem>
										{categories.map(category => (
											<SelectItem key={category.ID} value={String(category.ID)}>
												{category.Name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Dialog>
									<DialogTrigger asChild>
										<Button variant='outline'>
											<Filter className='mr-2 h-4 w-4' /> Filters
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Фильтры</DialogTitle>
										</DialogHeader>
										<div className='space-y-4'>
											<div>
												<Label>Описание</Label>
												<Input
													value={localDescription}
													onChange={e => setLocalDescription(e.target.value)}
													placeholder='Поиск по описанию'
												/>
											</div>
											<div>
												<Label>Сумма</Label>
												<Input
													type='number'
													value={localAmount ?? ''}
													onChange={e =>
														setLocalAmount(
															e.target.value ? Number(e.target.value) : null
														)
													}
													placeholder='Сумма'
												/>
											</div>
											<div>
												<Label>Бонусы</Label>
												<Input
													type='number'
													value={localBonusChange ?? ''}
													onChange={e =>
														setLocalBonusChange(
															e.target.value ? Number(e.target.value) : null
														)
													}
													placeholder='Бонусы'
												/>
											</div>
											<div>
												<Label>Дата</Label>
												<DatePicker
													date={localDate ? new Date(localDate) : null}
													setDate={newDate => {
														setLocalDate(newDate ? newDate.toISOString() : null)
													}}
												/>
											</div>
											<div>
												<Label>Тип транзакции</Label>
												<Select
													value={localType}
													onValueChange={value => setLocalType(value as any)}
												>
													<SelectTrigger>
														<SelectValue placeholder='Тип' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='all'>Все</SelectItem>
														<SelectItem value='income'>Доход</SelectItem>
														<SelectItem value='expense'>Расход</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label>Тип бонуса</Label>
												<Select
													value={localBonusType}
													onValueChange={value =>
														setLocalBonusType(value as any)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder='Тип бонуса' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='all'>Все</SelectItem>
														<SelectItem value='income'>Доход</SelectItem>
														<SelectItem value='expense'>Расход</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<DialogFooter>
											<Button
												variant='outline'
												onClick={() => {
													setLocalDescription('')
													setLocalAmount(null)
													setLocalBonusChange(null)
													setLocalDate(null)
													setLocalType('all')
													setLocalBonusType('all')
												}}
											>
												Сбросить
											</Button>
											<DialogClose asChild>
												<Button
													onClick={() => {
														setAdvancedFilters({
															description: localDescription,
															amount: localAmount,
															bonusChange: localBonusChange,
															date: localDate,
															type: localType,
															bonusType: localBonusType,
														})
													}}
												>
													Применить
												</Button>
											</DialogClose>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						<div className='rounded-md border space-y-4'>
							{Object.entries(
								transactions.reduce((groups, transaction) => {
									const date = format(
										new Date(transaction.Date),
										'd MMMM yyyy',
										{
											locale: ru,
										}
									)
									if (!groups[date]) {
										groups[date] = []
									}
									groups[date].push(transaction)
									return groups
								}, {})
							).map(([date, dayTransactions]) => (
								<div key={date} className='border-b last:border-b-0'>
									<div className='bg-muted px-4 py-2'>
										<h3 className='font-medium'>{date}</h3>
									</div>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Category</TableHead>
												<TableHead>Title</TableHead>
												<TableHead>Bonus</TableHead>
												<TableHead className='text-right'>Amount</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{dayTransactions.map(transaction => {
												const categoryObj = categories.find(
													cat => cat.ID === transaction.Category
												)
												return (
													<TableRow
														key={transaction.ID}
														onClick={() => handleTransactionClick(transaction)}
														role='button'
														tabIndex={0}
														className='cursor-pointer hover:zinc-800 transition-colors'
													>
														<TableCell>
															{categoryObj
																? categoryObj.Name
																: 'Неизвестная категория'}
														</TableCell>
														<TableCell>
															{transaction.Title &&
															transaction.Title.length > 15
																? transaction.Title.slice(0, 15) + '...'
																: transaction.Title}
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
							))}
						</div>
					</CardContent>
				</Card>
			</div>
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Удалить категорию?</DialogTitle>
					</DialogHeader>
					<p>
						Вы уверены, что хотите удалить эту транзакцию? Действие необратимо.
					</p>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Отмена
						</Button>
						<Button variant='destructive' onClick={handleDeleteTransaction}>
							Удалить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
