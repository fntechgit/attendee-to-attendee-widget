import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { signIn, signUp } from './Auth'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
)

export const useStore = (props) => {
  const [accessList, setAccessList] = useState([])
  const [newAccess, handleNewAccess] = useState()
  const [accessListener, setAccessListener] = useState(null)

  useEffect(() => {
    fetchCurrentPageAttendees(props.url)
      .then((response) => {
        //console.log(response)
        //setAccessList(response.accessList.sort((a, b) => b.id - a.id))
        setAccessList(response)
      })
      .catch(console.error)
  }, [props.url])

  useEffect(() => {
    const handleAsync = async () => {
      if (newAccess) {
        fetchCurrentPageAttendees(newAccess.current_url)
          .then((response) => {
            setAccessList(response)
          })
          .catch(console.error)
        //console.log('access news', newAccess)
      }
    }
    handleAsync()
  }, [newAccess])

  useEffect(() => {
    if (!accessListener) {
      setAccessListener(
        supabase
          //.from(`accesses:list_id=eq.${list.id}`)
          .from(`accesses`)
          .on('INSERT', (payload) => handleNewAccess(payload.new))
          .on('UPDATE', (payload) => handleNewAccess(payload.new))
          .subscribe()
      )
    }
  }, [accessListener])

  return { accessList }
}

const getAttendeeUser = async (attendeeProfile) => {
  const { email, fullName, picUrl } = attendeeProfile
  let user = {}
  
  const attFetchRes = await supabase
    .from('attendees')
    .select(`id`)
    .eq('email', email)

  if (attFetchRes.error) {
    throw new Error(attFetchRes.error)
  }

  if (attFetchRes.data && attFetchRes.data.length > 0) {
    user = await signIn(
      supabase,
      email,
      process.env.REACT_APP_ATTENDEE_DEFAULT_PWD
    )
  } else {
    user = await signUp(
      supabase,
      email,
      fullName,
      process.env.REACT_APP_ATTENDEE_DEFAULT_PWD,
      picUrl
    )
  }

  return user
}

const fetchCurrentPageAttendees = async (url) => {
  try {
    let { data, error } = await supabase
      .from('accesses')
      .select(`*, attendees(*)`)
    //.eq('current_url', url)
    if (error) {
      throw new Error(error)
    }
    //console.log(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

const logAccess = async (accessEntry) => {
  console.log('logAccess: ', accessEntry)
  // const insRes = await supabase.from('access_tracking').insert([accessEntry])

  // if (insRes.error) {
  //   throw new Error(insRes.error)
  // }
}

export const trackAccess = async (attendeeProfile, summitId, url, fromIP) => {
  try {
    const user = await getAttendeeUser(attendeeProfile)

    if (!user) {
      throw new Error('User not found')
    }

    console.log('trackAccess -> user:', user)

    //check existing access entry
    const fetchRes = await supabase
      .from('accesses')
      .select(`*, attendees(*)`)
      .match({ attendee_id: user.id, summit_id: summitId })

    if (fetchRes.error) {
      throw new Error(fetchRes.error)
    }

    // console.log('attendee_id', user.id)
    // console.log('summit_id', summitId)
    // console.log('summit_id', url)
    // console.log('summit_id', fromIP)
    // console.log('fetchRes.data', fetchRes.data)

    if (fetchRes.data && fetchRes.data.length > 0) {
      const access = fetchRes.data[0]
      console.log('access to update', access)
      const { data, error } = await supabase
        .from('accesses')
        .update([
          {
            current_url: url,
            attendee_ip: fromIP
          }
        ])
        .eq('id', access.id)
      if (error) {
        throw new Error(error)
      }
      console.log('updated access', data)
      return
    }

    const insRes = await supabase.from('accesses').insert([
      {
        attendee_id: user.id,
        summit_id: summitId,
        current_url: url,
        attendee_ip: fromIP
      }
    ])

    if (insRes.error) {
      throw new Error(insRes.error)
    }
    console.log('inserted data: ', insRes.data)
  } catch (error) {
    console.log('error', error)
  }
  return
}
