import { useState, useEffect } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({})
  const [accessNews, handleAccessNews] = useState(null)
  const [accessListener, setAccessListener] = useState(null)

  const accessRepo = props.accessRepository

  useEffect(() => {
    if (accessNews) {
      setAttendeesNews(accessNews)
    }
  }, [accessNews, props.url])

  useEffect(() => {
    if (!accessListener) {
      setAccessListener(
        accessRepo.subscribe((payload) => {
          if (props.summitId === payload.summit_id) {
            console.log('rt access news')
            handleAccessNews(payload)
          }
        })
      )
    }
  }, [accessListener])

  return { attendeesNews }
}
