import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import NotLoginModal from '@/components/ui/NotLoginModal'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinTrack - Financial Analysis',
  description: 'Comprehensive financial tracking and analysis platform',
};


export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body>
				<ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
					<Toaster />
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
