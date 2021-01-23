const addAttendee = async (supabase, id, fullName, email, picUrl) => {
  let { error } = await supabase
    .from('attendees')
    .insert([{ id, full_name: fullName, email, pic_url: picUrl }])

  if (error) {
    throw new Error(error)
  }
  //console.log('data: ', data)
}

export const signUp = async (supabase, email, fullName, password, picUrl) => {
  const { error, data } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) {
    throw new Error(error)
  }
  addAttendee(supabase, data.user.id, fullName, email, picUrl)
  return data.user
}

export const signIn = async (supabase, email, password) => {
  const { error, data } = await supabase.auth.signIn({
    email,
    password
  })
  if (error) {
    console.log('signIn -> error: ', error)
  }
  console.log('signIn -> data: ', data)
  return data.user
}

export const signOut = async (supabase) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log('signOut -> error: ', error)
  }
}
