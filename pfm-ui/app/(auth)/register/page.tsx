'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import RootLayout from '@/app/layout'

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const { toast } = useToast()
	const [error, setError] = useState('')

	// Функция-обработчик изменений в полях формы
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		})
	}

	// Массив требований к паролю
	const passwordCriteria = [
		{
			label: 'Не менее 8 символов',
			isValid: formData.password.length >= 8,
		},
		{
			label: 'Хотя бы одна строчная буква',
			isValid: /[a-z]/.test(formData.password),
		},
		{
			label: 'Хотя бы одна заглавная буква',
			isValid: /[A-Z]/.test(formData.password),
		},
		{
			label: 'Хотя бы одна цифра',
			isValid: /\d/.test(formData.password),
		},
	]

	// Дополнительная проверка для подтверждения пароля
	const confirmPasswordValid =
		formData.confirmPassword === '' ||
		formData.password === formData.confirmPassword

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

    const normalizedEmail = formData.email.toLowerCase()
    formData.email = normalizedEmail
		// Если хотя бы одно требование к паролю не выполнено, не отправляем форму
		const isPasswordValid = passwordCriteria.every(criteria => criteria.isValid)
		if (!isPasswordValid) {
			toast({
				title: 'Ошибка',
				description: 'Пароль не соответствует всем требованиям',
				variant: 'destructive',
			})
			return
		}

		if (!confirmPasswordValid) {
			toast({
				variant: 'destructive',
				title: 'Ошибка',
				description: 'Пароли не совпадают',
			})
			return
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				}
			)
			const data = await response.json()
			console.log(data)
			if ( response.ok) {
				window.location.href = '/dashboard'
			} else {
				setError(data.error || 'Ошибка регистрации')
        toast({
					title: 'Ошибка регистрации',
					description: data.error || 'Ошибка регистрации',
					variant: 'destructive',
				})
				return
			}
		} catch (error) {
			console.error(error)
			setError('Произошла ошибка при выполнении запроса')
      toast({
				title: 'Ошибка',
				description: 'Произошла ошибка при выполнении запроса',
				variant: 'destructive',
			})
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-background px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold'>
						Create an account
					</CardTitle>
					<CardDescription>
						Enter your information to get started with FinTrack
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className='space-y-4'>
						{/* {error && <RootLayout>{error}</RootLayout>} */}
						<div className='space-y-2'>
							<Label htmlFor='username'>Full Name</Label>
							<Input
								id='username'
								placeholder='John Doe'
								value={formData.username}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='username@example.com'
								value={formData.email}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								value={formData.password}
								onChange={handleChange}
								required
							/>
							{/* Чек-лист требований к паролю */}
							<ul className='mt-2 space-y-1 pl-4'>
								{passwordCriteria.map((criteria, idx) => (
									<li
										key={idx}
										className={`flex items-center text-sm ${
											criteria.isValid ? 'text-green-600' : 'text-red-600'
										}`}
									>
										<span className='mr-2'>{criteria.isValid ? '✓' : '✗'}</span>
										{criteria.label}
									</li>
								))}
							</ul>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='confirmPassword'>Confirm Password</Label>
							<Input
								id='confirmPassword'
								type='password'
								value={formData.confirmPassword}
								onChange={handleChange}
								required
							/>
							{formData.confirmPassword && !confirmPasswordValid && (
								<p className='mt-2 text-sm text-red-600'>Пароли не совпадают</p>
							)}
						</div>
					</CardContent>
					<CardFooter className='flex flex-col space-y-4'>
						<Button type='submit' className='w-full'>
							Create Account
						</Button>
						<div className='text-sm text-center space-x-1'>
							<span className='text-muted-foreground'>
								Already have an account?
							</span>
							<Link href='/login' className='text-primary hover:underline'>
								Sign in
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
