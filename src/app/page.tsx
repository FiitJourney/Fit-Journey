"use client"

import { useEffect, useState } from 'react'
import { supabase, Juice, Progress, isSupabaseConfigured } from '@/lib/supabase'
import { JuiceCard } from '@/components/juice-card'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Droplet, TrendingDown, Calendar, Sparkles, RefreshCw, Target, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

export default function Home() {
  const [juices, setJuices] = useState<(Juice & { preparation?: string })[]>([])
  const [todayJuice, setTodayJuice] = useState<(Juice & { preparation?: string }) | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState('demo-user-id') // Em produção, usar autenticação real
  const [supabaseReady, setSupabaseReady] = useState(false)

  const currentDay = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  useEffect(() => {
    const checkSupabase = isSupabaseConfigured()
    setSupabaseReady(checkSupabase)
    
    if (checkSupabase) {
      loadJuices()
      loadProgress()
    }
  }, [])

  const loadJuices = async () => {
    if (!isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('juices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Erro ao carregar sucos:', error)
        return
      }

      setJuices(data || [])
      
      // Encontrar suco de hoje
      const today = data?.find(j => j.day_of_week === currentDay && !j.consumed)
      setTodayJuice(today || null)
    } catch (error) {
      console.error('Erro ao carregar sucos:', error)
    }
  }

  const loadProgress = async () => {
    if (!isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) {
        console.error('Erro ao carregar progresso:', error)
        return
      }

      setProgress(data || [])
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    }
  }

  const generateJuice = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Configure o Supabase primeiro! Veja o banner acima.')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-juice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: currentDay,
          userGoal: 'emagrecimento saudável',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar suco')
      }

      const juiceData = await response.json()

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('juices')
        .insert({
          user_id: userId,
          name: juiceData.name,
          ingredients: juiceData.ingredients,
          benefits: juiceData.benefits,
          calories: juiceData.calories,
          day_of_week: currentDay,
          consumed: false,
        })
        .select()
        .single()

      if (error) throw error

      setTodayJuice({ ...data, preparation: juiceData.preparation })
      toast.success('Suco do dia gerado com sucesso!')
      loadJuices()
    } catch (error: any) {
      console.error('Erro ao gerar suco:', error)
      
      if (error.message?.includes('OpenAI') || error.message?.includes('API')) {
        toast.error('Configure sua chave da OpenAI! Veja o banner acima.')
      } else {
        toast.error('Erro ao gerar suco. Verifique as configurações.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const markAsConsumed = async (juiceId: string) => {
    if (!isSupabaseConfigured()) {
      toast.error('Configure o Supabase primeiro!')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('juices')
        .update({ consumed: true, consumed_at: new Date().toISOString() })
        .eq('id', juiceId)

      if (error) throw error

      toast.success('Suco marcado como consumido!')
      loadJuices()
      setTodayJuice(null)
    } catch (error) {
      console.error('Erro ao marcar suco:', error)
      toast.error('Erro ao registrar consumo.')
    } finally {
      setIsLoading(false)
    }
  }

  const consumedJuices = juices.filter(j => j.consumed)
  const totalCaloriesSaved = consumedJuices.reduce((acc, j) => acc + (j.calories || 0), 0)
  const weeklyGoal = 7
  const weeklyConsumed = consumedJuices.filter(j => {
    const juiceDate = new Date(j.consumed_at || j.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return juiceDate >= weekAgo
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-emerald-200 dark:border-emerald-900 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 shadow-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">
                  Fit Journey
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sua jornada detox inteligente
                </p>
              </div>
            </div>
            <Button
              onClick={generateJuice}
              disabled={isGenerating || !!todayJuice || !supabaseReady}
              className="bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Suco do Dia
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Alert de Configuração */}
        {!supabaseReady && (
          <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
              Configuração Necessária
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Para usar o Fit Journey, você precisa configurar o Supabase e a OpenAI.
              <br />
              <strong>Veja o arquivo SETUP.md</strong> para instruções detalhadas ou clique no banner laranja acima para configurar as variáveis de ambiente.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="today" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white dark:bg-gray-900 shadow-lg">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentDay}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Seu suco detox personalizado para hoje
              </p>
            </div>

            {todayJuice ? (
              <div className="max-w-2xl mx-auto">
                <JuiceCard
                  juice={todayJuice}
                  onConsume={markAsConsumed}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto p-12 text-center border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
                <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Pronto para começar?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {supabaseReady 
                    ? 'Clique no botão acima para gerar seu suco detox personalizado para hoje!'
                    : 'Configure o Supabase e a OpenAI para começar sua jornada detox!'}
                </p>
                {supabaseReady && (
                  <Button
                    onClick={generateJuice}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Gerar Meu Suco
                      </>
                    )}
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Seu Progresso
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe sua jornada de emagrecimento saudável
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Sucos Consumidos"
                value={consumedJuices.length}
                icon={Droplet}
                trend={`${weeklyConsumed} esta semana`}
                trendUp={weeklyConsumed >= weeklyGoal}
              />
              <StatsCard
                title="Meta Semanal"
                value={`${weeklyConsumed}/${weeklyGoal}`}
                icon={Target}
                trend={`${Math.round((weeklyConsumed / weeklyGoal) * 100)}% completo`}
                trendUp={weeklyConsumed >= weeklyGoal}
              />
              <StatsCard
                title="Calorias Detox"
                value={totalCaloriesSaved}
                icon={TrendingDown}
                trend="Total consumido"
                trendUp={true}
              />
              <StatsCard
                title="Dias Ativos"
                value={new Set(consumedJuices.map(j => new Date(j.consumed_at || j.created_at).toDateString())).size}
                icon={Calendar}
                trend="Dias únicos"
                trendUp={true}
              />
            </div>

            {/* Progress Chart Placeholder */}
            <Card className="p-8 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Evolução Semanal
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Continue consumindo seus sucos para ver seu progresso aqui!</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Histórico de Sucos
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Todos os seus sucos detox
              </p>
            </div>

            {juices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {juices.map((juice) => (
                  <JuiceCard key={juice.id} juice={juice} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl">
                <Droplet className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum suco ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {supabaseReady 
                    ? 'Comece gerando seu primeiro suco detox!'
                    : 'Configure o Supabase para começar!'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
