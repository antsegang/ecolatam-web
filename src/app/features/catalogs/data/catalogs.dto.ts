// Envelope del API
export interface ApiEnvelope<T> { error: boolean; status: number; body: T; }

// DTOs tal cual suelen venir del backend (ajusta nombres si cambian)
export interface PaisDTO      { id: number; name: string; }
export interface ProvinciaDTO { id: number; name: string; id_pais: number; }
export interface CantonDTO    { id: number; name: string; id_provincia: number; }
export interface DistritoDTO  { id: number; name: string; id_canton: number; }
