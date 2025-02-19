'use client'

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp'
import NotLoginModal from '@/components/ui/NotLoginModal'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'


export default function VerifyPage() {
	const router = useRouter()
	const [code, setCode] = useState('')
	const { toast } = useToast()
	const handleVerify = async () => {
		// Добавьте логику проверки кода здесь
		console.log('Verification code:', code)
		if (code.length!=6) {
			toast({
				title: 'Ошибка',
				description: 'Код должен быть полным',
				variant: 'destructive',
			})
		}
		try{
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {code},
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('token')}` 
					},
				}
			)
			if (response.status === 200) {
				router.push('/dashboard/settings')
			} else {
				toast({
					title: 'Ошибка',
					description:
						response.data.error || 'Ошибка подтверждения',
					variant: 'destructive',
				})
			}
		}catch (error) {
			toast({
				title: 'Ошибка',
				description: 'Ошибка подтверждения',
				variant: 'destructive',
			})
		}
		setCode('')
	}

	return (
		<>
			<NotLoginModal />
			<div className='flex flex-col items-center justify-center h-screen'>
				<div className='w-full max-w-md'>
					<h1 className='text-2xl font-bold mb-4'>Подтверждение аккаунта</h1>
					<p className='mb-4'>
						We have sent a verification code to your email. Please enter it
						below to verify your account.
					</p>

					{/* Добавлены пропсы value и onChange */}
					<InputOTP
						maxLength={6}
						value={code}
						onChange={value => setCode(value.toString())}
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>

					<Button
						onClick={handleVerify}
						className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
					>
						Verify
					</Button>
				</div>
			</div>
		</>
	)
}
