// Identidad interna de API; los contratos de perfil compartidos se anadiran despues.
export interface SupabaseIdentity {
  supabaseUserId: string;
  sessionId: string;
}
