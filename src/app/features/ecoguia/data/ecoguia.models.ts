// Modelos UI (camelCase) para EcoGuía

export interface BusinessListItem {
  id: number;
  name: string;
  slug?: string;
  short?: string;           // breve descripción
  categoryLabel?: string;   // etiqueta de categoría (si aplica)
  locationLabel?: string;   // "Provincia, Cantón, Distrito"
  logoUrl?: string;
  coverUrl?: string;
}

export interface BusinessDetail extends BusinessListItem {
  description?: string;     // html/markdown renderizado en UI
  email?: string;
  phone?: string;
  website?: string;
  social?: Partial<Record<'x'|'instagram'|'facebook'|'linkedin'|'youtube', string>>;
}

export interface ProductItem {
  id: number;
  businessId: number;
  name: string;
  short?: string;
  price?: number | null;
  currency?: string;        // ISO 4217, p.ej. "USD"
  imageUrl?: string;
}

export interface ServiceItem {
  id: number;
  businessId: number;
  name: string;
  short?: string;
  price?: number | null;
  currency?: string;
  imageUrl?: string;
}

export interface Page<T> {
  items: T[];
  limit: number;
  offset: number;
  total?: number;
  hasMore: boolean;
}

