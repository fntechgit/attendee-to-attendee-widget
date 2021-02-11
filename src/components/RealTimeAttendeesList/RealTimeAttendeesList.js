import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import AccessRepository from '../../lib/AccessRepository'
import { useStore } from '../../lib/Store'
import AttendeesListItem from '../AttendeesListItem/AttendeesListItem'
//import List from '../Shared/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import style from "./style.module.scss"

let accessRepo = null
let pageIx = 0
const pageSize = 6

const RealTimeAttendeesList = (props) => {
  const { supabaseUrl, supabaseKey } = props
  const [hasMore, setHasMore] = useState(true)
  const [attendeesList, setAttendeesList] = useState([])

  if (!accessRepo) {
    accessRepo = new AccessRepository(supabaseUrl, supabaseKey)
  }
  const { attendeesNews } = useStore({ url: window.location.href, accessRepository: accessRepo })

  useEffect(() => {
    if (attendeesNews) {
      if (attendeesList.length == 0) {
          accessRepo.fetchCurrentPageAttendees(window.location.href)
          .then((response) => {
            setAttendeesList(response)
          })
        .catch(console.error)
      } else {
        console.log('merge data')
      }
    }
  }, [attendeesNews])
 
  const fetchMoreData = async () => {
    const nextPage = await accessRepo.fetchCurrentPageAttendees(window.location.href, ++pageIx, pageSize)
    if (nextPage.length == 0) {
      setHasMore(false)
      return
    }
    setAttendeesList([...attendeesList, ...nextPage])
  }

  if (attendeesList) {
    if (attendeesList.length > 0) {
      //return <List component={AttendeesListItem} items={accessList} style={style} {...props} />
      return (
        <InfiniteScroll
            dataLength={attendeesList.length}
            next={fetchMoreData}
            style={style}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            height={300}
          >
            {attendeesList.map(item => (
              <AttendeesListItem key={`item-${item.id}`} item={item} {...props} />
            ))}
        </InfiniteScroll>
      )
    }
    return <div>No info</div>
  }
  return <div>Loading...</div>
}

RealTimeAttendeesList.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired
}

export default RealTimeAttendeesList