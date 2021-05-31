export const roles = {
  ADMIN: 'admin',
  QA: 'qa',
  HELP: 'help',
  USER: 'user'
}

export const isAdmin = (user) => {
  return (
    user.groups &&
    (user.groups.includes('admins') || user.groups.includes('super-admins'))
  )
}
