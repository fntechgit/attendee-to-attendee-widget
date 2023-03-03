import PropTypes from 'prop-types'
import { forwardRef, useImperativeHandle, useCallback, useEffect } from 'react'
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

  const onBeforeUnload = useCallback(e => {
    const promise = accessRepo.cleanUpAccess()
    if (promise) {
      addToPendingWork(promise)
    }
    if (pendingOps.size) {
      e.returnValue = 'Are you sure you want to leave?'
    }
  }, []);

  const onVisibilitychange = useCallback(_ => {
    if (document.visibilityState === 'visible') {
      trackAccess()
    } else {
      onLeave()
    }
  }, []);

  const switchOff = (e) => {
    if (props.keepAliveEnabled) stopKeepAlive()
    if (typeof window !== 'undefined') {
      const pageScopeTracking = props.trackingLevel === trackingLevel.PAGE_SCOPED_PRESENCE
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (pageScopeTracking) document.removeEventListener('visibilitychange', onVisibilitychange)
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
      onLeave()
      switchOff()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    signOut() {
      switchOff()
      accessRepo?.signOut()
    },
    bindToWindowLifecycle() {
      console.log('bindToWindowLifecycle');
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', onBeforeUnload)
      }
    },
    unbindFromWindowLifecycle() {
      console.log('unbindFromWindowLifecycle');
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
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
