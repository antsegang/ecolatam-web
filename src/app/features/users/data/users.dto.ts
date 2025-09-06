// DTOs tal como vienen del backend (snake_case)
export interface UserDTO {
  id: number;
  name: string | null;
  lastname: string | null;
  username?: string | null;
  email?: string | null;

  birthdate?: string | null;     // 'YYYY-MM-DD'
  location?: string | null;
  zip?: string | null;
  phone?: string | null;
  cellphone?: string | null;

  id_pais?: number | null;
  id_provincia?: number | null;
  id_canton?: number | null;
  id_distrito?: number | null;

  created_at?: string | null;    // 'YYYY-MM-DD'
  edited_at?: string | null;     // 'YYYY-MM-DD' | null

  // Si el backend hace join con catálogos y retorna nombres
  provincia_name?: string | null;
  canton_name?: string | null;
  distrito_name?: string | null;
}

// Listado puede venir como array puro o como { items, total }
export type UsersListApiBody = UserDTO[] | { items: UserDTO[]; total: number };
