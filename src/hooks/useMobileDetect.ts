'use client'

import { useState, useEffect } from 'react'

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
}

export function useMobileDetect(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
  })

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Check if touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Check iOS
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      
      // Check Android
      const isAndroid = /android/i.test(userAgent)
      
      // Check mobile
      const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      
      // Check tablet
      const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent.toLowerCase())
      
      // Desktop is neither mobile nor tablet
      const isDesktop = !isMobile && !isTablet
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouchDevice,
      })
    }
    
    checkDevice()
    
    // Re-check on resize
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])
  
  return detection
}