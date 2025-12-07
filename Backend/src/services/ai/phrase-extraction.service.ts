import { ChatOpenAI } from "@langchain/openai";
import { envs } from "../../config/env";

export interface ExtractedPhrase {
  phrase: string;
  author: string | null;
  tags: string[];
  confidence: number;
  context?: string;
}

export interface PhraseExtractionResult {
  phrases: ExtractedPhrase[];
  totalFound: number;
}

export class PhraseExtractionService {
  private llm: ChatOpenAI | undefined;

  constructor() {
    // Não lançar erro aqui - verificar apenas quando usar
    if (!envs.openai.apiKey || envs.openai.apiKey.trim() === "") {
      console.warn("⚠️  OPENAI_API_KEY não configurada. Funcionalidades de IA estarão desabilitadas.");
      // Não inicializar o LLM se não houver chave
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        modelName: "gpt-4o-mini", // Modelo mais econômico e rápido
        temperature: 0.3, // Menor temperatura para respostas mais consistentes
        openAIApiKey: envs.openai.apiKey,
        maxTokens: 2000,
      });
    } catch (error) {
      console.error("Erro ao inicializar ChatOpenAI:", error);
      // Não lançar erro - permitir que o servidor inicie
    }
  }

  /**
   * Extrai frases relevantes de um texto longo usando IA
   */
  async extractPhrases(text: string): Promise<PhraseExtractionResult> {
    // Verificar se o serviço está configurado
    if (!this.llm) {
      throw new Error("OPENAI_API_KEY não configurada no ambiente");
    }

    if (!text || text.trim().length < 50) {
      return {
        phrases: [],
        totalFound: 0,
      };
    }

    // Limitar tamanho do texto para evitar custos
    const limitedText = text.substring(0, 8000);

    // Construir o prompt diretamente sem usar template variables para evitar conflito com chaves no texto
    const systemMessage = `Você é um assistente especializado em extrair frases inspiradoras, memoráveis e significativas de textos longos.

Sua tarefa é:
1. Identificar frases que sejam citações, pensamentos profundos, reflexões ou declarações marcantes
2. Extrair o autor quando mencionado no texto ou contexto
3. Sugerir tags relevantes (máximo 3-5 tags por frase)
4. Avaliar a relevância de cada frase (confiança de 0 a 1)

IMPORTANTE:
- Priorize frases que sejam citações diretas, pensamentos profundos ou declarações memoráveis
- Ignore frases muito curtas (menos de 10 palavras) ou muito longas (mais de 200 palavras)
- Se o autor não estiver claro, deixe como null
- As tags devem ser em português, relevantes e específicas
- Retorne APENAS um JSON válido, sem markdown, sem texto adicional

Formato de resposta (JSON):
{
  "phrases": [
    {
      "phrase": "texto da frase completa",
      "author": "nome do autor ou null",
      "tags": ["tag1", "tag2", "tag3"],
      "confidence": 0.95,
      "context": "contexto opcional que ajuda a entender a frase"
    }
  ]
}`;

    const humanMessage = `Extraia as frases mais relevantes e memoráveis deste texto:\n\n${limitedText}`;

    try {
      // Usar invoke diretamente com mensagens ao invés de template
      const response = await this.llm.invoke([
        ["system", systemMessage],
        ["human", humanMessage],
      ]);

      // Parse da resposta
      const content = response.content as string;
      let parsedResponse: { phrases: ExtractedPhrase[] };

      // Tentar extrair JSON da resposta (pode vir com markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(content);
      }

      // Validar e filtrar frases
      const validPhrases = parsedResponse.phrases
        .filter((p: any) => {
          return (
            p.phrase &&
            p.phrase.trim().length >= 10 &&
            p.phrase.trim().length <= 500 &&
            Array.isArray(p.tags) &&
            typeof p.confidence === "number" &&
            p.confidence > 0.5 // Apenas frases com confiança > 50%
          );
        })
        .map((p: any) => ({
          phrase: p.phrase.trim(),
          author: p.author && p.author.trim() ? p.author.trim() : null,
          tags: Array.isArray(p.tags)
            ? p.tags
                .slice(0, 5)
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0)
            : [],
          confidence: Math.min(1, Math.max(0, p.confidence || 0.5)),
          context: p.context ? p.context.trim() : undefined,
        }))
        .sort((a: ExtractedPhrase, b: ExtractedPhrase) => b.confidence - a.confidence) // Ordenar por confiança
        .slice(0, 20); // Limitar a 20 frases mais relevantes

      return {
        phrases: validPhrases,
        totalFound: validPhrases.length,
      };
    } catch (error) {
      console.error("Erro ao extrair frases com IA:", error);
      throw new Error(
        "Erro ao processar o texto. Tente novamente ou verifique se o texto é válido."
      );
    }
  }

  /**
   * Extrai frases de múltiplos textos (batch processing)
   */
  async extractPhrasesBatch(
    texts: string[]
  ): Promise<PhraseExtractionResult> {
    const allPhrases: ExtractedPhrase[] = [];

    // Processar em lotes para evitar rate limits
    const batchSize = 3;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((text) => this.extractPhrases(text))
      );

      results.forEach((result) => {
        allPhrases.push(...result.phrases);
      });

      // Pequeno delay entre lotes para evitar rate limits
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      phrases: allPhrases.sort(
        (a, b) => b.confidence - a.confidence
      ),
      totalFound: allPhrases.length,
    };
  }
}

