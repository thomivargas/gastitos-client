import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'

/**
 * Wrapper de zodResolver para Zod v4.
 * z.coerce.number() en Zod v4 infiere input como `unknown`,
 * lo cual es incompatible con useForm<Output>. Este helper
 * castea el resolver al tipo de salida del schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formResolver<TOutput extends FieldValues>(schema: any): Resolver<TOutput> {
  return zodResolver(schema) as unknown as Resolver<TOutput>
}
