export const TRUCK_PLACEHOLDERS = [
  'https://haulagua.onrender.com/uploads/haulagua_water_tank_truck_b75d535bc8.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_dust_control_bc77843df3.webp',
  'https://haulagua.onrender.com/uploads/haulagua_water_hauler_directory_1815cc4915.webp',
]

export function getPlaceholderImage(haulerSlug: string): string {
  const index = haulerSlug.length % TRUCK_PLACEHOLDERS.length
  return TRUCK_PLACEHOLDERS[index]
}