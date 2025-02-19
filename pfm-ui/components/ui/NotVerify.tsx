// components/ui/NotVerify.tsx
'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { useAtom } from 'jotai'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NewVerifyCode } from '@/api/NewVerifyCode'
import { useToast } from '@/hooks/use-toast'
import { Button } from './button'
import { verifySuccessAtom } from '@/lib/atoms'

export default function NotVerify() {
	const { toast } = useToast()
	const router = useRouter()
	const [verifySuccess, setVerifySuccess] = useAtom(verifySuccessAtom)

	const handleVerify = async () => {
		try {
			await NewVerifyCode(toast)
			setVerifySuccess(true) // Устанавливаем успешное состояние
			router.push('/verify') // Переход на страницу подтверждения
		} catch (error) {
			toast({
				title: 'Ошибка',
				description: 'Не удалось отправить код подтверждения',
				variant: 'destructive',
			})
		}
	}

	return (
		<Alert variant='destructive'>
			<AlertCircle className='h-4 w-4' />
			<AlertTitle>Вы не подтвердили свою учётную запись</AlertTitle>
			<AlertDescription className='flex flex-col gap-3'>
				Нажмите на кнопку для отправки кода подтверждения повторно.
				<Button onClick={handleVerify} variant='outline' size='sm'>
					Отправить код повторно
				</Button>
			</AlertDescription>
		</Alert>
	)
}
