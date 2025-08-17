'use client'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SiteLogoPropsBase {
  className?: string
}

interface SiteLogoPropsMobile extends SiteLogoPropsBase {
  isMobileScreen: true
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface SiteLogoPropsDesktop extends SiteLogoPropsBase {
  isMobileScreen?: false
  setIsOpen?: never
}

type SiteLogoProps = SiteLogoPropsMobile | SiteLogoPropsDesktop

export function SiteLogo({
  className,
  isMobileScreen = false,
  setIsOpen,
}: SiteLogoProps) {
  // const user = useAppStore((state) => state.user)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const { theme, systemTheme } = useTheme()
  // console.log(`\n\n ~ theme:`, theme)
  const router = useRouter()

  const handleClick = () => {
    if (isMobileScreen && setIsOpen) {
      setIsOpen(false)
    }
    router.push('/')
  }

  useEffect(() => {
    if (theme === 'dark') {
      setMode('dark')
    } else if (theme === 'system') {
      if (systemTheme === 'dark') {
        setMode('dark')
      } else {
        setMode('light')
      }
    } else {
      setMode('light')
    }
  }, [theme, systemTheme])

  return (
    <div onClick={handleClick} className={cn('cursor-pointer', className)}>
      <Image
        width={150}
        height={36}
        priority
        src={mode == 'light' ? '/logo.png' : '/logo.png'}
        blurDataURL={mode == 'light' ? '/logo.png' : '/logo.png'}
        alt="logo"
        className="h-auto w-full"
        placeholder="blur"
      />
      <span className="sr-only">Home</span>
    </div>
  )
}
