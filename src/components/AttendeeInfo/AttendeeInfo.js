import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import style from './style.module.scss'

export const AttendeeInfo = ({ user, classes }) => {
  return (
    <div className={style.attendeeInfoContainer}>
      <Card className={style.card}>
        <div className={style.details}>
          <CardContent className={style.content}>
            <Typography component='h5' variant='h5'>
              {user.fullName}
            </Typography>
            <Typography variant='subtitle1' color='textSecondary'>
              {user.title}
            </Typography>
            <Typography variant='subtitle1' color='textSecondary'>
              {user.company}
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
