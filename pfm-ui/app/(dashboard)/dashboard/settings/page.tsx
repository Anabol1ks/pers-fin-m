"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import NotLoginModal from '@/components/ui/NotLoginModal'
import { UserInfo } from '@/api/UserInfo'
import { useToast } from '@/hooks/use-toast'
import { verifySuccessAtom } from '@/lib/atoms'
import NotVerify from '@/components/ui/NotVerify'
import { useAtom } from 'jotai'


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true,
  });

  const [user, setUser] = useState('');
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
	const [verifySuccess] = useAtom(verifySuccessAtom)

  useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				await Promise.all([UserInfo(setUser, toast)])
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
				<h1 className='text-3xl font-bold'>Settings</h1>

				{!user.verify && <NotVerify />}
				{verifySuccess && <p>Код подтверждения успешно отправлен!</p>}
				<div className='grid gap-6'>
					<Card>
						<CardHeader>
							<CardTitle>Profile Settings</CardTitle>
							<CardDescription>
								Manage your account settings and preferences.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Display Name</Label>
								<p>{user.username ? user.username : '...'}</p>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='email'>Email Address</Label>
								<p>{user.email ? user.email : '...'}</p>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='currency'>Default Currency</Label>
								<Select defaultValue='RUB'>
									<SelectTrigger id='currency'>
										<SelectValue placeholder='Select currency' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='RUB'>Russian Ruble (₽)</SelectItem>
										<SelectItem value='USD'>US Dollar ($)</SelectItem>
										<SelectItem value='EUR'>Euro (€)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Appearance</CardTitle>
							<CardDescription>
								Customize how FinTrack looks on your device.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='theme'>Theme</Label>
								<Select value={theme} onValueChange={setTheme}>
									<SelectTrigger id='theme' className='w-[180px]'>
										<SelectValue placeholder='Select theme' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='light'>Light</SelectItem>
										<SelectItem value='dark'>Dark</SelectItem>
										<SelectItem value='system'>System</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Notifications</CardTitle>
							<CardDescription>
								Configure how you want to receive notifications.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Email Notifications</Label>
									<CardDescription>
										Receive notifications about your transactions via email
									</CardDescription>
								</div>
								<Switch
									checked={notifications.email}
									onCheckedChange={checked =>
										setNotifications({ ...notifications, email: checked })
									}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Push Notifications</Label>
									<CardDescription>
										Get notified about important updates on your device
									</CardDescription>
								</div>
								<Switch
									checked={notifications.push}
									onCheckedChange={checked =>
										setNotifications({ ...notifications, push: checked })
									}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Weekly Report</Label>
									<CardDescription>
										Receive a weekly summary of your finances
									</CardDescription>
								</div>
								<Switch
									checked={notifications.weekly}
									onCheckedChange={checked =>
										setNotifications({ ...notifications, weekly: checked })
									}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Monthly Report</Label>
									<CardDescription>
										Receive a monthly detailed financial report
									</CardDescription>
								</div>
								<Switch
									checked={notifications.monthly}
									onCheckedChange={checked =>
										setNotifications({ ...notifications, monthly: checked })
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Data Management</CardTitle>
							<CardDescription>
								Manage your data and export options.
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex flex-col gap-4'>
								<div>
									<Button variant='outline' className='w-full sm:w-auto'>
										Export All Data
									</Button>
								</div>
								<div>
									<Button variant='destructive' className='w-full sm:w-auto'>
										Delete Account
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}