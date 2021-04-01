import { useState, useRef, useEffect } from 'react'

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({})
  const [accessNews, handleAccessNews] = useState(null)
  const [accessListener, setAccessListener] = useState([])
  const [chatNotificationsMap, setChatNotificationsMap] = useState({})

  const { summitId } = props

  const accessRepo = props.accessRepository
  const chatRepo = props.chatRepository

  const firsUpdate = useRef(true)

  useEffect(() => {

    if (firsUpdate.current) {
      return;
    }

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

          setChatNotificationsMap(
            chatRepo.syncChatNotificationsMap(
              chatNotificationsMap,
              fromAttendeeId,
              payload.status
            )
          )

          //Fetch current attendee access
          accessRepo
            .findByAttendeeId(fromAttendeeId, summitId)
            .then((attendeeAccess) => {
              handleAccessNews({
                ...attendeeAccess,
                notification_status: payload.status
              })
            })
        })
      ])
    }
  }, [accessListener])

  useEffect(() => {
    if (Object.keys(chatNotificationsMap).length === 0) {
      chatRepo.fetchChatNotifications(summitId).then((cn) => {
        setChatNotificationsMap(chatRepo.chatNotificationsToMap(cn))
        firsUpdate.current = false;
      })
    }
  }, [])

  return { attendeesNews, chatNotificationsMap }
}
