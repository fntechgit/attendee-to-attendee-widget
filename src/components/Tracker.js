import PropTypes from 'prop-types'
import { forwardRef, useImperativeHandle, useEffect } from 'react'
import publicIp from 'public-ip'
import { extractBaseUrl } from '../utils/urlHelper'
import { trackingLevel } from '../models/trackingLevel'
import SupabaseClientBuilder from '../lib/builders/supabaseClientBuilder'
import AccessRepository from '../lib/repository/accessRepository'

const Tracker = forwardRef((props, ref) => {
  const { supabaseUrl, supabaseKey, summitId } = props
  let accessRepo = null
  const pendingOps = new Set()
  let timerHandler = null

  const trackAccess = async () => {
    const clientIP = await publicIp.v4()
    accessRepo.trackAccess(
      props.user,
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
      timerHandler = null
    }
  }

  const onLeave = async () => {
    //console.log('leaving tracked page')
    await accessRepo.trackAccess(props.user, '', '', false)
  }

  function addToPendingWork(promise) {
    pendingOps.add(promise)
    const cleanup = () => pendingOps.delete(promise)
    promise.then(cleanup).catch(cleanup)
  }

  const onBeforeUnload = (e) => {
    addToPendingWork(accessRepo.cleanUpAccess())
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
    accessRepo = new AccessRepository(
      SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
      false,
      summitId
    )
    const pageScopeTracking = props.trackingLevel === trackingLevel.PAGE_SCOPED_PRESENCE
    trackAccess()
    if (props.keepAliveEnabled) startKeepAlive()
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onBeforeUnload)
      if (pageScopeTracking) document.addEventListener('visibilitychange', onVisibilitychange)
    }
    return () => {
      if (props.keepAliveEnabled) stopKeepAlive()
      onLeave()
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onBeforeUnload)
        if (pageScopeTracking) document.removeEventListener('visibilitychange', onVisibilitychange)
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
  }).isRequired,
  trackingLevel: PropTypes.string,
  keepAliveEnabled: PropTypes.bool
}

Tracker.defaultProps = {
  trackingLevel: trackingLevel.PAGE_SCOPED_PRESENCE,
  keepAliveEnabled: true
}

export default Tracker
