const validate = (email, password) => {
  if (!email) return 'Email is required'
  if (!password) return 'Password is required'
  return null
}

export const signUp = async (supabase, email, password) => {
  const hasErrors = validate(email, password)
  if (hasErrors) throw new Error(hasErrors)

  let { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) {
    if (error.status === 400) { //User already registered
      return await signIn(supabase, email, password)
    }
    throw new Error(error)
  }
  return data.user
}

export const signIn = async (supabase, email, password) => {
  const hasErrors = validate(email, password)
  if (hasErrors) throw new Error(hasErrors)
  
  const { data } = await supabase.auth.signIn({
    email,
    password
  })
  return data.user
}

export const signOut = async (supabase) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error trying signout user')
  }
}
