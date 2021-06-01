const hashCode = (s) =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

export const nameToId = (name) => {
  return hashCode(name)
}
