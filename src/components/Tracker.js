import React from 'react'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import publicIp from 'public-ip'
import AccessRepository from '../lib/AccessRepository'

const Tracker = (props) => {

  useEffect(() => {
    const handleAsync = async () => {
      const accessRepo = new AccessRepository(props.supabaseUrl, props.supabaseKey)
      const clientIP = await publicIp.v4()
      accessRepo.trackAccess(
        props.user,
        props.summitId,
        window.location.href,
        clientIP
      )
    }
    handleAsync()
  }, [])

  return (
    <div>
      {/* <button
        onClick={async () => {
          const rnd = Math.floor(Math.random() * 10) + 1
          const clientIP = await publicIp.v4()
          trackAccess(
            props.user,
            props.summitId,
            `http://localhost:3000/${rnd}`,
            clientIP
          )
        }}
      >
        Mock access
      </button> */}
    </div>
  )
}

Tracker.propTypes = {
  supabaseUrl: PropTypes.string.isRequired,
  supabaseKey: PropTypes.string.isRequired,
  summitId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    picUrl: PropTypes.string
  }).isRequired
}

export default Tracker
