"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [newCategory, setNewCategory] = useState({ name: "", color: "#000000", type: "expense" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([
        ...categories,
        { id: categories.length + 1, ...newCategory },
      ]);
      setNewCategory({ name: "", color: "#000000", type: "expense" });
      setIsDialogOpen(false);
    }
  };

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
										value={newCategory.name}
										onChange={e =>
											setNewCategory({ ...newCategory, name: e.target.value })
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
											value={newCategory.color}
											onChange={e =>
												setNewCategory({
													...newCategory,
													color: e.target.value,
												})
											}
											className='w-24 h-10 p-1'
										/>
										<Input
											value={newCategory.color}
											onChange={e =>
												setNewCategory({
													...newCategory,
													color: e.target.value,
												})
											}
											placeholder='#000000'
											className='flex-1'
										/>
									</div>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='type'>Type</Label>
									<select
										id='type'
										value={newCategory.type}
										onChange={e =>
											setNewCategory({ ...newCategory, type: e.target.value })
										}
										className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
									>
										<option value='expense'>Expense</option>
										<option value='income'>Income</option>
									</select>
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
						<Card key={category.id}>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<div className='flex items-center space-x-2'>
									<div
										className='w-4 h-4 rounded-full'
										style={{ backgroundColor: category.color }}
									/>
									<CardTitle className='text-sm font-medium'>
										{category.name}
									</CardTitle>
								</div>
								<div className='flex space-x-2'>
									<Button variant='ghost' size='icon'>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button variant='ghost' size='icon'>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Type:{' '}
									{category.type.charAt(0).toUpperCase() +
										category.type.slice(1)}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	)
}