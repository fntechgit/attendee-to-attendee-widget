export const nameToId = (name) => {
  return name.replace(/\s+/g, '_').toLowerCase()
}
