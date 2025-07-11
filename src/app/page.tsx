"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock, LogIn } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const login = async () => {
        if (!email || !password) {
            toast.error("Por favor, preencha email e senha.")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("http://localhost:8080/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (res.ok) {
                const data = await res.json()
                localStorage.setItem("jwt", data.token)
                localStorage.setItem("email", email)

                toast.success("Login realizado com sucesso!")

                setTimeout(() => {
                    router.push("/chat")
                }, 1000)
            } else {
                const errorData = await res.json().catch(() => ({}))
                toast.error(errorData.message || "Email ou senha incorretos. Tente novamente.")
            }
        } catch (error) {
            toast.error("Não foi possível conectar ao servidor. Verifique sua conexão.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            login()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <LogIn className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <CardTitle className="text-2xl font-bold text-foreground">Bem-vindo de volta</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Entre com suas credenciais para continuar
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={login}
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Entrar
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                Esqueceu sua senha?
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
