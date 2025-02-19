// api/NewVerifyCode.ts
import axios from 'axios'
import Cookies from 'js-cookie'

export async function NewVerifyCode(toast: any) {
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
			toast({
				title: 'Успешно',
				description: 'Новый код подтверждения отправлен',
			})
			return true // Возвращаем успешный результат
		} else {
			toast({
				title: 'Ошибка',
				description: 'Не удалось отправить код подтверждения',
				variant: 'destructive',
			})
			return false
		}
	} catch (error) {
		console.error('Не удалось отправить код подтверждения:', error)
		toast({
			title: 'Ошибка',
			description: 'Не удалось отправить код подтверждения',
			variant: 'destructive',
		})
		return false
	}
}
