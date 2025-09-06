// Envelope estándar del API
export type ApiEnvelope<T> = {
  error: boolean;
  status: number;
  body: T;
};

// Modelos UI (camelCase)
export interface UserListItem {
  id: number;
  name: string;             // derivado de dto.name (string o '')
  lastname: string;         // derivado de dto.lastname (string o '')
  username?: string;
  email?: string;
  createdAt?: string;       // dto.created_at
  locationLabel?: string;   // "Provincia, Cantón, Distrito"
}

export interface UserDetail extends UserListItem {
  birthdate?: string;
  location?: string;
  zip?: string;
  phone?: string;
  cellphone?: string;

  // IDs para selects dependientes en UI
  idPais?: number;
  idProvincia?: number;
  idCanton?: number;
  idDistrito?: number;

  editedAt?: string | null; // dto.edited_at
}

// Página basada en limit/offset (total opcional)
export interface Page<T> {
  items: T[];
  limit: number;
  offset: number;
  total?: number;
  hasMore: boolean;
}
