import { useEffect, useState, useRef } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({})
  const [accessNews, handleAccessNews] = useState(null)
  const [accessListener, setAccessListener] = useState(null)
  const mounted = useRef(false);

  useEffect(() => {
    if (accessNews) {
      setAttendeesNews(accessNews)
    }
  }, [accessNews, props.url])

  useEffect(() => {
    mounted.current = true;
    if (!accessListener) {
      setAccessListener(
        props.accessRepository.subscribe((payload) => {
          if (props.summitId === payload.summit_id && mounted.current) {
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
