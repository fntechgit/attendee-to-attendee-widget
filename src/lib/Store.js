import { useState, useEffect } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState([])
  const [accessNews, handleAccessNews] = useState({})
  const [accessListener, setAccessListener] = useState(null)

  const accessRepo = props.accessRepository

  // useEffect(() => {
  //   setAttendeesNews(null)
  //   accessRepo.fetchCurrentPageAttendees(props.url)
  //     .then((response) => {
  //       //console.log(response)
  //       setAttendeesNews(response)
  //     })
  //     .catch(console.error)
  // }, [props.url])

  useEffect(() => {
    //if (accessNews) {
    // accessRepo.fetchCurrentPageAttendees(props.url)
    //   .then((response) => {
    //     setAttendeesNews(response)
    //   })
    // .catch(console.error)
    //}
    setAttendeesNews(accessNews)
  }, [accessNews, props.url])

  useEffect(() => {
    if (!accessListener) {
      setAccessListener(accessRepo.subscribe((payload) => { 
        handleAccessNews(payload) 
      }))
    }
  }, [accessListener])

  return { attendeesNews }
}