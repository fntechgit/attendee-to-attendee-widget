import { useState, useEffect } from 'react'
import AccessRepository from './AccessRepository'

export const useStore = (props) => {
  const [accessList, setAccessList] = useState([])
  const [accessNews, handleAccessNews] = useState()
  const [accessListener, setAccessListener] = useState(null)

  const accessRepo = new AccessRepository(props.supabaseUrl, props.supabaseKey)

  useEffect(() => {
    setAccessList(null)
    accessRepo.fetchCurrentPageAttendees(props.url)
      .then((response) => {
        //console.log(response)
        setAccessList(response)
      })
      .catch(console.error)
  }, [props.url])

  useEffect(() => {
    const handleAsync = async () => {
      if (accessNews) {
        accessRepo.fetchCurrentPageAttendees(props.url)
          .then((response) => {
            setAccessList(response)
          })
        .catch(console.error)
      }
    }
    handleAsync()
  }, [accessNews, props.url])

  useEffect(() => {
    if (!accessListener) {
      setAccessListener(accessRepo.subscribe(handleAccessNews))
    }
  }, [accessListener])

  return { accessList }
}