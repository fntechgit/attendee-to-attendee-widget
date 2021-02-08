import PropTypes from 'prop-types'
import { useEffect } from 'react'
import publicIp from 'public-ip'
import AccessRepository from '../lib/AccessRepository'

const Tracker = (props) => {
  const accessRepo = new AccessRepository(
    props.supabaseUrl,
    props.supabaseKey
  )

  const onEnter = async () => {
    const clientIP = await publicIp.v4()
    accessRepo.trackAccess(
      props.user,
      props.summitId,
      window.location.href,
      clientIP,
      true
    )
  }

  const onLeave = async () => {
    console.log('leaving tracked page')
    await accessRepo.trackAccess(props.user, props.summitId, '', '', false)
  }

  const onBeforeUnload = e => {
    accessRepo.cleanUpAccess(props.summitId)
    e.returnValue = ''
  }

  useEffect(() => {
    onEnter()
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onBeforeUnload)
    }
    return () => {
      onLeave()
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
    }
  }, [])
  
  return null
}

Tracker.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired,
  summitId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    company: PropTypes.string,
    title: PropTypes.string,
    picUrl: PropTypes.string
  }).isRequired
}

export default Tracker
