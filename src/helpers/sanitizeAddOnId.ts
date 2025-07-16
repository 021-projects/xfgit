export default function sanitizeAddOnId(addOnId: string): string {
  // Remove any leading or trailing whitespace
  addOnId = addOnId.trim()

  // Replace any invalid characters with underscores
  return addOnId.replace('/', '-').replace(/[^a-zA-Z0-9_-]/g, '_')
}
