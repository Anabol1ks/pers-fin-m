'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NewVerifyCode } from '@/api/NewVerifyCode'
import { useToast } from '@/hooks/use-toast'
import { Button } from './button'



export default function NotVerify() {
	const { toast } = useToast()
	const [suc, setSuc] = useState(false)

	return (
		<Alert variant='destructive'>
			<AlertCircle className='h-4 w-4' />
			<AlertTitle>Вы не подтвердили свою учётную запись</AlertTitle>
			<AlertDescription className='flex flex-col gap-3'>
				Нажмите на кнопку для отправки кода подтверждения повторно.
				<Button
					onClick={() => NewVerifyCode(toast)}
					variant='outline'
					size='sm'
				>
					Отправить код повторно
				</Button>
			</AlertDescription>
		</Alert>
	)
}
