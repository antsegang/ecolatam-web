// DTOs tal como vienen del backend (ajusta a tu contrato real)

export interface ApiEnvelope<T> { error: boolean; status: number; body: T; }

export interface BusinessDTO {
  id: number;
  name: string | null;
  slug?: string | null;
  short?: string | null;
  description?: string | null;
  category_name?: string | null; // o category -> normalizar en mapper
  provincia_name?: string | null;
  canton_name?: string | null;
  distrito_name?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  x?: string | null; instagram?: string | null; facebook?: string | null; linkedin?: string | null; youtube?: string | null;
}

export interface ProductDTO {
  id: number;
  id_business: number;
  name: string | null;
  short?: string | null;
  price?: number | null;
  currency?: string | null;
  image_url?: string | null;
}

export interface ServiceDTO {
  id: number;
  id_business: number;
  name: string | null;
  short?: string | null;
  price?: number | null;
  currency?: string | null;
  image_url?: string | null;
}

export type BusinessListApiBody = BusinessDTO[] | { items: BusinessDTO[]; total: number };

// Creación de negocio (payload UI -> API)
export interface CreateBusinessPayloadDTO {
  // Campos estrictos esperados por backend
  name: string;
  location: string;
  id_pais: number;
  id_provincia: number;
  id_canton: number;
  id_distrito: number;
  zip: string;
  id_bcategory: number;
  phone: string;
  // Usuario creador (lo agrega el API con sesión)
  id_user?: number | null;
}

// KYC básico para negocio (payload)
export interface BusinessKycPayloadDTO {
  legal_name?: string | null;
  tax_id?: string | null;
  representative_name?: string | null;
  representative_id?: string | null;
  address?: string | null;
}
