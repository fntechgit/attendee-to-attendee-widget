import React from 'react'
import PropTypes from 'prop-types'
import publicIp from 'public-ip'
import { trackAccess } from '../lib/Store'

const Tracker = (props) => {
  return (
    <div>
      {/* <button
        onClick={async () => {
          const clientIP = await publicIp.v4()
          trackAccess(
            props.user,
            props.summitId,
            window.location.href,
            clientIP
          )
        }}
      >
        Mock access
      </button> */}
      <button
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
      </button>
    </div>
  )
}

Tracker.propTypes = {
  summitId: PropTypes.number.isRequired,
  user: PropTypes.any.isRequired
}

export default Tracker
