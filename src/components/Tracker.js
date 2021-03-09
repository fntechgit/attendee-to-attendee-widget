import PropTypes from 'prop-types'
import { forwardRef, useImperativeHandle, useEffect } from 'react'
import publicIp from 'public-ip'
import AccessRepository from '../lib/AccessRepository'

const Tracker = forwardRef((props, ref) => {
  const accessRepo = new AccessRepository(props.supabaseUrl, props.supabaseKey)

  const pendingOps = new Set()

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

  function addToPendingWork(promise) {
    pendingOps.add(promise)
    const cleanup = () => pendingOps.delete(promise)
    promise.then(cleanup).catch(cleanup)
  }

  const leaveSite = async () => {
    accessRepo.cleanUpAccess(props.summitId)
    accessRepo.signOut()
  }

  const onBeforeUnload = (e) => {
    addToPendingWork(leaveSite)
    if (pendingOps.size) {
      e.returnValue = 'Are you sure you want to leave?'
    }
  }

  const onVisibilitychange = (_) => {
    if (document.visibilityState === 'visible') {
      onEnter()
    } else {
      onLeave()
    }
  }

  useEffect(() => {
    onEnter()
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onBeforeUnload)
      document.addEventListener('visibilitychange', onVisibilitychange)
    }
    return () => {
      onLeave()
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onBeforeUnload)
        document.removeEventListener('visibilitychange', onVisibilitychange)
      }
    }
  }, [])

  useImperativeHandle(ref, () => ({
    signOut() {
      accessRepo.signOut()
    }
  }))

  return null
})

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
