export const TRUCK_PLACEHOLDERS = [
  'https://haulagua.onrender.com/uploads/haulagua_water_tank_truck_66f7eaaf35.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_dust_control_037460ea63.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_directory_cd27c32eb3.webp',
]

export function getPlaceholderImage(haulerSlug: string): string {
  const index = haulerSlug.length % TRUCK_PLACEHOLDERS.length
  return TRUCK_PLACEHOLDERS[index]
}