export const TRUCK_PLACEHOLDERS = [
  'https://haulagua.onrender.com/uploads/haulagua_water_tank_truck_b89cd0b90e.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_dust_control_6ed288ba45.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_directory_fec9c020fc.webp',
]

export function getPlaceholderImage(haulerSlug: string): string {
  const index = haulerSlug.length % TRUCK_PLACEHOLDERS.length
  return TRUCK_PLACEHOLDERS[index]
}