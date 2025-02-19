'use client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export async function NewVerifyCode(toast: any) {
	const router = useRouter()

	const token = Cookies.get('token')
	try {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/newVerify`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.data) {
			router.push('/verify')
			toast({
				title: 'Успешно',
				description: 'Новый код подтверждения отправлен',
			})
		} else {
			console.log('Ошибка загрузки информации профиля')
			toast({
				title: 'Ошибка',
				description: 'Не удалось отправить код подтверждени',
				variant: 'destructive',
			})
		}
	} catch (error) {
		console.error('Не удалось отправить код подтверждени:', error)
		toast({
			title: 'Ошибка',
			description: 'Не удалось отправить код подтверждени',
			variant: 'destructive',
		})
	}
}
