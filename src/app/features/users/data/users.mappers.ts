import { UsersListApiBody, UserDTO } from './users.dto';
import { Page, UserDetail, UserListItem } from './users.models';

/** Sanea string: null/undefined/'' -> undefined (si trae contenido: trim) */
const s = (v?: string | null) => {
  const t = (v ?? '').trim();
  return t.length ? t : undefined;
};

/** Componer etiqueta de ubicación si el backend trae *_name */
const locationLabel = (d: Partial<UserDTO>) => {
  const parts = [s(d.provincia_name), s(d.canton_name), s(d.distrito_name)].filter(Boolean) as string[];
  return parts.length ? parts.join(', ') : undefined;
};

/** DTO -> UI (item listado) */
export const mapUserDtoToListItem = (d: UserDTO): UserListItem => ({
  id: d.id,
  name: s(d.name) ?? '',
  lastname: s(d.lastname) ?? '',
  username: s(d.username),
  email: s(d.email),
  createdAt: s(d.created_at),
  locationLabel: locationLabel(d),
});

/** DTO -> UI (detalle) */
export const mapUserDtoToDetail = (d: UserDTO): UserDetail => ({
  ...mapUserDtoToListItem(d),
  birthdate: s(d.birthdate),
  location: s(d.location),
  zip: s(d.zip),
  phone: s(d.phone),
  cellphone: s(d.cellphone),
  idPais: d.id_pais ?? undefined,
  idProvincia: d.id_provincia ?? undefined,
  idCanton: d.id_canton ?? undefined,
  idDistrito: d.id_distrito ?? undefined,
  editedAt: d.edited_at ?? null,
});

/** Normaliza listados (array puro o {items,total}) -> Page<UserListItem> */
export function normalizeUsersListBody(
  body: UsersListApiBody,
  limit: number,
  offset: number
): Page<UserListItem> {
  const itemsDTO = Array.isArray(body) ? body : body.items;
  const items = itemsDTO.map(mapUserDtoToListItem);
  const total = Array.isArray(body) ? undefined : body.total;

  const hasMore = total != null
    ? offset + items.length < total
    : items.length === limit;

  return { items, total, limit, offset, hasMore };
}

/* ============================
   (Opcional) Mapper inverso UI -> Payload de creación
   ============================ */

// Modelo de formulario en UI (camelCase)
export type UserForm = {
  name: string;
  lastname: string;
  birthdate?: string;
  location?: string;
  idPais?: number;
  idProvincia?: number;
  idCanton?: number;
  idDistrito?: number;
  zip?: string;
  cellphone?: string;
  phone?: string;
  username?: string;
  email?: string;
  password?: string;
};

// Payload que espera el backend (snake_case)
export type CreateUserPayload = {
  id?: number; // opcional si el backend autogenera
  name: string;
  lastname: string;
  birthdate?: string;
  location?: string;
  id_pais?: number;
  id_provincia?: number;
  id_canton?: number;
  id_distrito?: number;
  zip?: string;
  cellphone?: string;
  phone?: string;
  username?: string;
  email?: string;
  password?: string;
};

export const toCreateUserPayload = (f: UserForm): CreateUserPayload => ({
  name: f.name,
  lastname: f.lastname,
  birthdate: f.birthdate,
  location: f.location,
  id_pais: f.idPais,
  id_provincia: f.idProvincia,
  id_canton: f.idCanton,
  id_distrito: f.idDistrito,
  zip: f.zip,
  cellphone: f.cellphone,
  phone: f.phone,
  username: f.username,
  email: f.email,
  password: f.password,
});
