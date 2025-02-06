'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Button } from './button'

export default function NotLoginModal() {
  const [period, setPeriod] = useState('monthly')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      setShowAuthDialog(true)
    }
  }, [])

  const handleLoginRedirect = () => {
    router.push('/login')
  }

	return (
		<Dialog open={showAuthDialog} onOpenChange={() => router.push('/login')}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Требуется аутентификация</DialogTitle>
					<DialogDescription>
						Пожалуйста, войдите в систему, чтобы получить доступ к панели
						мониторинга
					</DialogDescription>
				</DialogHeader>
				<div className='flex justify-end space-x-2 mt-4'>
					<Button onClick={handleLoginRedirect}>Go to Login</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
