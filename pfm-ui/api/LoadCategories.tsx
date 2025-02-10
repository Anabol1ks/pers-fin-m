import axios from 'axios'
import Cookies from 'js-cookie'
import { useToast } from '@/hooks/use-toast'

export async function LoadCategories ( setCategories: any, toast: any ) {
	const token = Cookies.get('token')
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/categories`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.data) {
			console.log(response.data)
			setCategories(response.data)
		} else {
			toast({
				title: 'Ошибка',
				description:
					'Ошибка при загрузке категорий, отображены демонстрационные категории',
				variant: 'destructive',
			})
		}
	} catch (error) {
		console.error('Ошибка при загрузке категорий:', error)
		toast({
			title: 'Ошибка',
			description:
				'Ошибка при загрузке категорий, отображены демонстрационные категории',
			variant: 'destructive',
		})
	}
}
