import { useEffect, useState, useRef } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({})
  const [accessNews, handleAccessNews] = useState(null)
  const [accessListener, setAccessListener] = useState(null)
  const mounted = useRef(false);

  const accessRepo = props.accessRepository

  useEffect(() => {
    //console.log('rt access news', !!accessNews)
    if (accessNews) {
      setAttendeesNews(accessNews)
    }
  }, [accessNews, props.url])

  useEffect(() => {
    mounted.current = true;
    if (!accessListener) {
      setAccessListener(
        accessRepo.subscribe((payload) => {
          if (props.summitId === payload.summit_id && mounted.current) {
            //console.log('rt att id', payload.attendee_id)
            handleAccessNews(payload)
          }
        })
      )
    }
    return () => {
      mounted.current = false;
    }
  }, [accessListener])

  return { attendeesNews }
}
