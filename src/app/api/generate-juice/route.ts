import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: Request) {
  try {
    // Verificar se a chave da OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da OpenAI não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      )
    }

    const { dayOfWeek, userGoal } = await request.json()

    const prompt = `Você é um nutricionista especializado em sucos detox para emagrecimento saudável no Brasil.

Crie uma receita de suco detox ideal para ${dayOfWeek}, considerando:
- Rotina típica do brasileiro neste dia da semana
- Ingredientes facilmente encontrados no Brasil
- Objetivo: ${userGoal || 'emagrecimento saudável'}
- Foco em desintoxicação e aceleração do metabolismo

Retorne APENAS um JSON válido (sem markdown) no formato:
{
  "name": "Nome criativo do suco",
  "ingredients": ["ingrediente 1", "ingrediente 2", "ingrediente 3"],
  "benefits": "Descrição dos benefícios específicos deste suco",
  "calories": número_aproximado_de_calorias,
  "preparation": "Modo de preparo simples"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um nutricionista especializado em sucos detox brasileiros. Sempre responda em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const juiceData = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(juiceData)
  } catch (error: any) {
    console.error('Erro ao gerar suco:', error)
    
    // Mensagens de erro mais específicas
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Chave da OpenAI inválida. Verifique sua configuração.' },
        { status: 401 }
      )
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Créditos da OpenAI esgotados. Adicione créditos na sua conta.' },
        { status: 402 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao gerar receita de suco. Verifique suas configurações.' },
      { status: 500 }
    )
  }
}
