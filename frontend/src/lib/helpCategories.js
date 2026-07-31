import { IconCatCode, IconCatConcept, IconCatStart } from './icons.js'

/**
 * Ba loại vướng mắc học viên tự chọn. Nhãn và tông màu do backend trả về trong
 * `/api/session`; ở đây chỉ gắn thêm icon vì icon không truyền qua JSON được.
 */
const ICONS = {
  code: IconCatCode,
  concept: IconCatConcept,
  start: IconCatStart,
}

export const CATEGORY_ORDER = ['code', 'concept', 'start']

export function categoryMeta(catalog, id) {
  const entry = catalog?.[id]
  if (!entry) return null
  return { id, label: entry.label, tone: entry.tone, Icon: ICONS[id] ?? IconCatConcept }
}

export function categoryList(catalog) {
  return CATEGORY_ORDER.map((id) => categoryMeta(catalog, id)).filter(Boolean)
}
