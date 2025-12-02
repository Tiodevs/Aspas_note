import { Request, Response } from "express";
import { PhraseExtractionService } from "../services/ai/phrase-extraction.service";

// Instância do serviço - agora não quebra o servidor se a chave não estiver configurada
const phraseExtractionService = new PhraseExtractionService();

export class AIController {
  /**
   * Extrai frases relevantes de um texto longo
   * POST /ai/extract-phrases
   */
  extractPhrases = async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim().length < 50) {
        return res.status(400).json({
          error: "Texto inválido. Forneça um texto com pelo menos 50 caracteres.",
          code: "INVALID_TEXT",
        });
      }

      // Limitar tamanho do texto para evitar custos excessivos
      if (text.length > 10000) {
        return res.status(400).json({
          error: "Texto muito longo. O limite é de 10.000 caracteres.",
          code: "TEXT_TOO_LONG",
        });
      }

      const result = await phraseExtractionService.extractPhrases(text);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro ao extrair frases:", error);

      // Verificar se é erro de API key
      if (error.message?.includes("API key")) {
        return res.status(500).json({
          error: "Erro de configuração da API. Verifique as credenciais.",
          code: "API_CONFIG_ERROR",
        });
      }

      res.status(500).json({
        error: error.message || "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Extrai frases de múltiplos textos (batch)
   * POST /ai/extract-phrases-batch
   */
  extractPhrasesBatch = async (req: Request, res: Response) => {
    try {
      const { texts } = req.body;

      if (
        !Array.isArray(texts) ||
        texts.length === 0 ||
        texts.length > 10
      ) {
        return res.status(400).json({
          error:
            "Forneça um array de textos (máximo 10 textos por requisição).",
          code: "INVALID_INPUT",
        });
      }

      const result = await phraseExtractionService.extractPhrasesBatch(texts);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro ao extrair frases em lote:", error);
      res.status(500).json({
        error: error.message || "Erro interno do servidor",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

