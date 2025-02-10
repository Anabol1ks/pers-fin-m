"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import NotLoginModal from '@/components/ui/NotLoginModal'
import Cookies from 'js-cookie'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from "@/components/ui/toast"
import { LoadCategories } from '@/api/LoadCategories'

const defaultCategories = [
  { id: 1, name: "Housing", color: "#FF6B6B", type: "expense" },
  { id: 2, name: "Food", color: "#4ECDC4", type: "expense" },
  { id: 3, name: "Transport", color: "#45B7D1", type: "expense" },
  { id: 4, name: "Entertainment", color: "#96CEB4", type: "expense" },
  { id: 5, name: "Salary", color: "#4CAF50", type: "income" },
  { id: 6, name: "Investments", color: "#9C27B0", type: "income" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState({ Name: "", Color: "#000000" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false)
	const { toast } = useToast()
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
	const [categoryToDelete, setCategoryToDelete] = useState(null)
	const [categoryToUpdate, setCategoryToUpdate] = useState({
		Name: '',
		Color: '#000000',
		ID: null,
	})

	const handlerUpdateCategory = async () => {
		if (!categoryToUpdate.Name || !categoryToUpdate.Color) {
			toast({
				title: 'Ошибка',
				description: 'Введите название и цвет категории',
				variant: 'destructive',
			})
			return
		}
		try {
			const response = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToUpdate.ID}`,
				{
					Name: categoryToUpdate.Name,
					Color: categoryToUpdate.Color,
				},
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('token')}`,
					},
				}
			)
			if (response.status === 200) {
				toast({
					title: 'Категория обновлена',
					description: 'Вы успешно обновили категорию',
					variant: 'default',
				})
				setIsLoading(true)
			}else {
				toast({
					title: 'Ошибка',
					description: response.data.error || 'Не удалось обновить категорию',
					variant: 'destructive',
				})
			}
		}catch (error) {
			console.error('Ошибка обновления категории:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалось обновить категорию',
				variant: 'destructive',
			})
		}
		setIsUpdateDialogOpen(false)
		setCategoryToUpdate({
			Name: '',
			Color: '#000000',
			ID: null,
		})
	}


	const handleDeleteCategory = async () => {
		if (!categoryToDelete) return
		try {
			const response = await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete}`,
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('token')}`,
					},
				}
			)
			if (response.status === 200) {
				toast({
					title: 'Категория удалена',
					description: 'Вы успешно удалили категорию',
					variant: 'default',
				})
				setIsLoading(true)
			} else {
				toast({
					title: 'Ошибка',
					description: response.data.error || 'Не удалось удалить категорию',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Ошибка удаления категории:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалось удалить категорию',
				variant: 'destructive',
			})
		}

		setCategoryToDelete(null)
		setIsDeleteDialogOpen(false)
	}


  const handleAddCategory = async () => {
		if (newCategory.Name) {
			try {
				// Отправка новой категории на сервер
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/categories`,
					newCategory,
					{
						headers: {
							Authorization: `Bearer ${Cookies.get('token')}`,
						},
					}
				)

				// 
				if (response.data){
					console.log(response.data)
					toast({
						title: 'Успешно',
						description: 'Категория успешно создана',
						variant: 'default'
					})
					setNewCategory({ Name: '', Color: '#000000'	 })
					setIsDialogOpen(false)
					setIsLoading(true)
				}else {
					toast({
						title: 'Ошибка',
						description: response.data.error || 'Ошибка при создании категории',
						variant: 'destructive',
					})
				}
			} catch (error) {
				console.error('Ошибка создания категории:', error)
				toast({
					title: 'Ошибка',
					description: 'Ошибка при создании категории',
					variant: 'destructive',
				})
			}
		}
	}
	

	useEffect(()=>{
		LoadCategories(setCategories, toast)
	}, [isLoading]);

  return (
		<>
			<NotLoginModal />
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<h1 className='text-3xl font-bold'>Categories</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className='mr-2 h-4 w-4' /> Add Category
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Category</DialogTitle>
								<DialogDescription>
									Create a new category for organizing your transactions.
								</DialogDescription>
							</DialogHeader>
							<div className='grid gap-4 py-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										value={newCategory.Name}
										onChange={e =>
											setNewCategory({ ...newCategory, Name: e.target.value })
										}
										placeholder='Category name'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='color'>Color</Label>
									<div className='flex gap-2'>
										<Input
											id='color'
											type='color'
											value={newCategory.Color}
											onChange={e =>
												setNewCategory({
													...newCategory,
													Color: e.target.value,
												})
											}
											className='w-24 h-10 p-1'
										/>
										<Input
											value={newCategory.Color}
											onChange={e =>
												setNewCategory({
													...newCategory,
													Color: e.target.value,
												})
											}
											placeholder='#000000'
											className='flex-1'
										/>
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
								<Button onClick={handleAddCategory}>Add Category</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{categories
						.filter(category => category.ID !== 18)
						.map(category => (
							<Card key={category.ID}>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<div className='flex items-center space-x-2 flex-1'>
										<div
											className={`w-4 h-4 rounded-full`}
											style={{ backgroundColor: category.Color }}
										/>
										<CardTitle className='text-sm font-medium'>
											{category.Name}
										</CardTitle>
									</div>
									{!category.IsDefault && (
										<div className='flex space-x-2'>
											<Button
												variant='ghost'
												size='icon'
												onClick={() => {
													setIsUpdateDialogOpen(true)
													setCategoryToUpdate({
														Name: category.Name,
														Color: category.Color,
														ID: category.ID,
													})
												}}
											>
												<Pencil className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												onClick={() => {
													setCategoryToDelete(category.ID)
													setIsDeleteDialogOpen(true)
												}}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									)}
								</CardHeader>
							</Card>
						))}
				</div>
			</div>
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Удалить категорию?</DialogTitle>
					</DialogHeader>
					<p>
						Вы уверены, что хотите удалить эту категорию? Действие необратимо.
						Все связанные с категорией транзакции будут изменены на "Без
						категории".
					</p>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Отмена
						</Button>
						<Button variant='destructive' onClick={handleDeleteCategory}>
							Удалить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Изменение категории</DialogTitle>
						<DialogDescription>
							Измените категорию, измените название или цвет.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='update-name'>Name</Label>
							<Input
								id='update-name'
								value={categoryToUpdate?.Name || ''}
								onChange={e =>
									setCategoryToUpdate({
										...categoryToUpdate,
										Name: e.target.value,
									})
								}
								placeholder='Category name'
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='update-color'>Color</Label>
							<div className='flex gap-2'>
								<Input
									id='update-color'
									type='color'
									value={categoryToUpdate?.Color || '#000000'}
									onChange={e =>
										setCategoryToUpdate({
											...categoryToUpdate,
											Color: e.target.value,
										})
									}
									className='w-24 h-10 p-1'
								/>
								<Input
									value={categoryToUpdate?.Color || '#000000'}
									onChange={e =>
										setCategoryToUpdate({
											...categoryToUpdate,
											Color: e.target.value,
										})
									}
									placeholder='#000000'
									className='flex-1'
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsUpdateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handlerUpdateCategory}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}