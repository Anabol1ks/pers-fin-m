import axios from 'axios'
import Cookies from 'js-cookie'

export async function GetBalance(setBalance: any, toast: any) {
	const token = Cookies.get('token')
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/users/balance`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.data) {
			setBalance(response.data.balance)
		} else {
			console.log('Ошибка при загрузке баланса')
      toast({
        title: 'Ошибка',
        description: 'Ошибка при загрузке баланса',
        variant: 'destructive',
      })
		}
	} catch (error) {
		console.error('Ошибка при загрузке баланса:', error)
		toast({
			title: 'Ошибка',
			description: 'Ошибка при загрузке баланса',
			variant: 'destructive',
		})
	}
}

export async function GetBonus(setBonus: any, toast: any) {
	const token = Cookies.get('token')
	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/users/bonus`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.data) {
			setBonus(response.data.bonus)
		} else {
			console.log('Ошибка при загрузке бонусов')
			toast({
				title: 'Ошибка',
				description: 'Ошибка при загрузке бонусов',
				variant: 'destructive',
			})
		}
	} catch (error) {
		console.error('Ошибка при загрузке бонусов:', error)
		toast({
			title: 'Ошибка',
			description: 'Ошибка при загрузке бонусов',
			variant: 'destructive',
		})
	}
}