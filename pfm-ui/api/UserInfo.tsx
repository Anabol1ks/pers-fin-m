'use client'

import axios from 'axios'
import Cookies from 'js-cookie'

export async function UserInfo(setUser: any, toast: any) {
	const token = Cookies.get('token')
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/users/info`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.data) {
			setUser(response.data)
		} else {
			console.log('Ошибка загрузки информации профиля')
			toast({
				title: 'Ошибка',
				description: 'Ошибка загрузки информации профиля',
				variant: 'destructive',
			})
		}
	} catch (error) {
		console.error('Ошибка загрузки информации профиля:', error)
		toast({
			title: 'Ошибка',
			description: 'Ошибка загрузки информации профиля',
			variant: 'destructive',
		})
	}
}
