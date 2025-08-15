"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecionando...</h1>
        <p className="text-muted-foreground">Você será redirecionado para o login</p>
      </div>
    </div>
  )
}