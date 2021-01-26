import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { signIn, signUp } from './Auth'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
)

let sbUser

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

  const attFetchRes = await supabase
    .from('attendees')
    .select(`id`)
    .eq('email', email)

  if (attFetchRes.error) {
    throw new Error(attFetchRes.error)
  }

  if (attFetchRes.data && attFetchRes.data.length > 0) {
    if (!sbUser) {
      sbUser = await signIn(
        supabase,
        email,
        process.env.REACT_APP_ATTENDEE_DEFAULT_PWD
      )
    }
  } else {
    sbUser = await signUp(
      supabase,
      email,
      fullName,
      process.env.REACT_APP_ATTENDEE_DEFAULT_PWD,
      picUrl
    )
  }

  return sbUser
}

const fetchCurrentPageAttendees = async (url) => {
  try {
    let { data, error } = await supabase
      .from('accesses')
      .select(`*, attendees(*)`)
      .eq('current_url', url)
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
  const { error } = await supabase.from('access_tracking').insert([
    {
      access_id: accessEntry.id,
      summit_id: accessEntry.summit_id,
      url: accessEntry.current_url,
      attendee_ip: accessEntry.attendee_ip
    }
  ])

  if (error) {
    console.log(error)
    throw new Error(error)
  }
}

export const trackAccess = async (attendeeProfile, summitId, url, fromIP) => {
  try {
    const sbUser = await getAttendeeUser(attendeeProfile)

    if (!sbUser) {
      throw new Error('User not found')
    }

    //check existing access entry
    const fetchRes = await supabase
      .from('accesses')
      .select(`*, attendees(*)`)
      .match({ attendee_id: sbUser.id, summit_id: summitId })

    if (fetchRes.error) {
      throw new Error(fetchRes.error)
    }

    if (fetchRes.data && fetchRes.data.length > 0) {
      const access = fetchRes.data[0]
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

      logAccess(data[0])
      return
    }

    const insRes = await supabase.from('accesses').insert([
      {
        attendee_id: sbUser.id,
        summit_id: summitId,
        current_url: url,
        attendee_ip: fromIP
      }
    ])

    if (insRes.error) {
      throw new Error(insRes.error)
    }
    console.log('inserted data: ', insRes.data)
    logAccess(insRes.data[0])
  } catch (error) {
    console.log('error', error)
  }
  return
}
