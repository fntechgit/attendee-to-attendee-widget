import { useState, useEffect } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({})
  const [accessNews, handleAccessNews] = useState(null)
  const [accessListener, setAccessListener] = useState([])
  const [chatNotificationsMap, setChatNotificationsMap] = useState([])

  const { summitId } = props

  const accessRepo = props.accessRepository
  const chatRepo = props.chatRepository

  useEffect(() => {
    if (accessNews) {
      setAttendeesNews(accessNews)
    }
  }, [accessNews, props.url])

  useEffect(() => {
    if (accessListener.length === 0) {
      setAccessListener([
        accessRepo.subscribe((payload) => {
          handleAccessNews(payload)
        }),
        chatRepo.subscribe((payload) => {
          const fromAttendeeId = payload.from_attendee_id
          //Sync chat news hashmap
          chatNotificationsMap[fromAttendeeId] = payload.status
          setChatNotificationsMap(chatNotificationsMap)

          //Fetch current attendee access
          accessRepo.findByAttendeeId(fromAttendeeId, summitId).then((attendeeAccess) => {
            handleAccessNews({ ...attendeeAccess, notification_status: payload.status })
          })
        })
      ])
    }
  }, [accessListener])

  useEffect(() => {
    if (chatNotificationsMap.length === 0) {
      chatRepo.fetchChatNotifications(summitId).then((cn) => {
        setChatNotificationsMap(chatRepo.chatNotificationsToMap(cn)) 
      })
    }
  }, [])

  return { attendeesNews, chatNotificationsMap }
}
