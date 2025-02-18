'use client'

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp'
import NotLoginModal from '@/components/ui/NotLoginModal'
import { useState } from 'react'

export default function VerifyPage() {
	const [code, setCode] = useState('')

	const handleVerify = () => {
		// Добавьте логику проверки кода здесь
		console.log('Verification code:', code)
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
						onChange={value => setCode(value)}
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

					<button
						onClick={handleVerify}
						className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
					>
						Verify
					</button>
				</div>
			</div>
		</>
	)
}
