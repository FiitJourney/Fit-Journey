"use client"

import { Juice } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Droplet, Flame, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface JuiceCardProps {
  juice: Juice & { preparation?: string }
  onConsume?: (id: string) => void
  isLoading?: boolean
}

export function JuiceCard({ juice, onConsume, isLoading }: JuiceCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-950/20 dark:to-lime-950/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-lime-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lime-400/10 to-emerald-400/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                {juice.day_of_week}
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {juice.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Flame className="w-4 h-4" />
              <span>{juice.calories} calorias</span>
            </div>
          </div>
          
          {juice.consumed && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-medium">
              <Check className="w-4 h-4" />
              Consumido
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Ingredientes
          </h4>
          <div className="flex flex-wrap gap-2">
            {juice.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border border-emerald-200 dark:border-emerald-800"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Benefícios
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {juice.benefits}
          </p>
        </div>

        {/* Preparation */}
        {juice.preparation && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Modo de Preparo
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {juice.preparation}
            </p>
          </div>
        )}

        {/* Action button */}
        {!juice.consumed && onConsume && (
          <Button
            onClick={() => onConsume(juice.id)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? 'Registrando...' : 'Marcar como Consumido'}
          </Button>
        )}
      </div>
    </Card>
  )
}
