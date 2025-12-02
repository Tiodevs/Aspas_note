import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { z } from "zod";

const router = Router();
const aiController = new AIController();

// Schema de validação para extração de frases
const extractPhrasesSchema = z.object({
  body: z.object({
    text: z.string().min(50, "Texto deve ter pelo menos 50 caracteres"),
  }),
});

// Schema de validação para batch
const extractPhrasesBatchSchema = z.object({
  body: z.object({
    texts: z
      .array(z.string().min(50))
      .min(1, "Forneça pelo menos um texto")
      .max(10, "Máximo de 10 textos por requisição"),
  }),
});

// Middleware de validação simples
const validate = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.issues,
          code: "VALIDATION_ERROR",
        });
      }
      next(error);
    }
  };
};

// Rotas de IA
router.post(
  "/extract-phrases",
  authenticateToken,
  validate(extractPhrasesSchema),
  aiController.extractPhrases
);

router.post(
  "/extract-phrases-batch",
  authenticateToken,
  validate(extractPhrasesBatchSchema),
  aiController.extractPhrasesBatch
);

export default router;

