import { BusinessDTO, ProductDTO, ServiceDTO } from './ecoguia.dto';
import { BusinessDetail, BusinessListItem, Page, ProductItem, ServiceItem } from './ecoguia.models';

const s = (v?: string | null) => {
  const t = (v ?? '').trim();
  return t.length ? t : undefined;
};

const locationLabel = (d: Partial<BusinessDTO>) => {
  const parts = [s(d.provincia_name), s(d.canton_name), s(d.distrito_name)].filter(Boolean) as string[];
  return parts.length ? parts.join(', ') : undefined;
};

export const mapBusinessDtoToListItem = (d: BusinessDTO): BusinessListItem => ({
  id: d.id,
  name: s(d.name) ?? '',
  slug: s(d.slug),
  short: s(d.short),
  categoryLabel: s(d.category_name),
  locationLabel: locationLabel(d),
  logoUrl: s(d.logo_url),
  coverUrl: s(d.cover_url),
});

export const mapBusinessDtoToDetail = (d: BusinessDTO): BusinessDetail => ({
  ...mapBusinessDtoToListItem(d),
  description: s(d.description),
  email: s(d.email),
  phone: s(d.phone),
  website: s(d.website),
  social: {
    x: s(d.x), instagram: s(d.instagram), facebook: s(d.facebook), linkedin: s(d.linkedin), youtube: s(d.youtube)
  }
});

export const mapProductDto = (d: ProductDTO): ProductItem => ({
  id: d.id,
  businessId: d.id_business,
  name: s(d.name) ?? '',
  short: s(d.short),
  price: d.price ?? undefined,
  currency: s(d.currency),
  imageUrl: s(d.image_url),
});

export const mapServiceDto = (d: ServiceDTO): ServiceItem => ({
  id: d.id,
  businessId: d.id_business,
  name: s(d.name) ?? '',
  short: s(d.short),
  price: d.price ?? undefined,
  currency: s(d.currency),
  imageUrl: s(d.image_url),
});

export function normalizeList<T, R>(
  body: T[] | { items: T[]; total: number },
  limit: number,
  offset: number,
  map: (d: T) => R,
): Page<R> {
  const itemsDTO = Array.isArray(body) ? body : body.items;
  const items = itemsDTO.map(map);
  const total = Array.isArray(body) ? undefined : body.total;
  const hasMore = total != null ? offset + items.length < total : items.length === limit;
  return { items, total, limit, offset, hasMore };
}

