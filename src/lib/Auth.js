export const signUp = async (supabase, email, password) => {
  const { error, data } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw new Error(error)
  return data.user
}

export const signIn = async (supabase, email, password) => {
  const { data } = await supabase.auth.signIn({
    email,
    password
  })
  return data.user
}

export const signOut = async (supabase) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signOut -> error: ', error)
  }
}
