import { z } from "zod";

export const longUrlSchema = z.object({
  url: z.url({ error: "Debe ser una URL válida." }).nonempty('No debe estar vacía.'),
  expiresAt: z.optional(z.date('Debe ser una fecha válida.'))
})

export type longUrlSchemaType = z.infer<typeof longUrlSchema>;
