import React from 'react'
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography
} from '@material-ui/core'
import { GitHub, LinkedIn, Twitter } from '@material-ui/icons'

import style from './style.module.scss'

export const AttendeeInfo = ({ user, classes }) => {
  const {
    github_user,
    linked_in_profile,
    twitter_name,
    wechat_user,
    badge_features
  } = user
  return (
    <div className={style.attendeeInfoContainer}>
      <Card className={style.card} variant='outlined'>
        <div className={style.details}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                 <img className={style.img} alt={user.fullName} src={user.picUrl} />
              </Grid>
              <Grid item xs={8} zeroMinWidth>
                <Typography variant='body1' noWrap>
                  {user.fullName}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {user.title}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {user.company}
                </Typography>
                <Grid item xs={12}>
                  {github_user && (
                    <IconButton
                      href={`https://github.com/${github_user}/`}
                      target='_blank'
                    >
                      <GitHub fontSize='small' />
                    </IconButton>
                  )}
                  {linked_in_profile && (
                    <IconButton href={linked_in_profile} target='_blank'>
                      <LinkedIn fontSize='small' />
                    </IconButton>
                  )}
                  {twitter_name && (
                    <IconButton
                      href={`https://twitter.com/${twitter_name}/`}
                      target='_blank'
                    >
                      <Twitter fontSize='small' />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' color='textSecondary'>
                    {badge_features.map((bf) => bf)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
