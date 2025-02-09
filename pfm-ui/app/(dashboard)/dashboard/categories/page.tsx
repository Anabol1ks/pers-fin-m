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
		const loadCategories = async () => {
			const token = Cookies.get('token')
			try{
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
					headers: {
						Authorization: `Bearer ${token}`,
					}
				});
				if (response.data){
					console.log(response.data)
					setCategories(response.data)
				}else {
					toast({
						title: 'Ошибка',
						description: 'Ошибка при загрузке категорий, отображены демонстрационные категории',
						variant: 'destructive',
					})
					return
				}
			} catch (error) {
				console.error(error)
				toast({
					title: 'Ошибка',
					description: 'Ошибка при загрузке категорий, отображены демонстрационные категории',
					variant: 'destructive',
				})
			}
		};
		loadCategories();
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
					{categories.map(category => (
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
										<Button variant='ghost' size='icon'>
											<Pencil className='h-4 w-4' />
										</Button>
										<Button variant='ghost' size='icon'>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								)}
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		</>
	)
}