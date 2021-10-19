import PropTypes from 'prop-types'
import { forwardRef, useImperativeHandle, useEffect } from 'react'
import publicIp from 'public-ip'
import AccessRepository from '../lib/repository/AccessRepository'
import SupabaseClientBuilder from '../lib/SupabaseClientBuilder'
import { extractBaseUrl } from '../utils/urlHelper'

const Tracker = forwardRef((props, ref) => {
  const { supabaseUrl, supabaseKey } = props
  const accessRepo = new AccessRepository(
    SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
    false
  )
  const pendingOps = new Set()
  let timerHandler = null

  const trackAccess = async () => {
    const clientIP = await publicIp.v4()
    accessRepo.trackAccess(
      props.user,
      props.summitId,
      extractBaseUrl(window.location.href),
      clientIP,
      true
    )
  }

  const startKeepAlive = () => {
    stopKeepAlive()
    timerHandler = setInterval(() => {
      trackAccess()
    }, 300000)
  }

  const stopKeepAlive = () => {
    if (timerHandler) {
      clearInterval(timerHandler)
    }
  }

  const onLeave = async () => {
    //console.log('leaving tracked page')
    await accessRepo.trackAccess(props.user, props.summitId, '', '', false)
  }

  function addToPendingWork(promise) {
    pendingOps.add(promise)
    const cleanup = () => pendingOps.delete(promise)
    promise.then(cleanup).catch(cleanup)
  }

  const onBeforeUnload = (e) => {
    addToPendingWork(accessRepo.cleanUpAccess(props.summitId))
    if (pendingOps.size) {
      e.returnValue = 'Are you sure you want to leave?'
    }
  }

  const onVisibilitychange = (_) => {
    if (document.visibilityState === 'visible') {
      trackAccess()
    } else {
      onLeave()
    }
  }

  useEffect(() => {
    trackAccess()
    startKeepAlive()
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
    picUrl: PropTypes.string,
    socialInfo: PropTypes.shape({
      githubUser: PropTypes.string,
      linkedInProfile: PropTypes.string,
      twitterName: PropTypes.string,
      wechatUser: PropTypes.string
    }),
    bio: PropTypes.string,
    public_profile_show_email: PropTypes.bool
  }).isRequired
}

export default Tracker
