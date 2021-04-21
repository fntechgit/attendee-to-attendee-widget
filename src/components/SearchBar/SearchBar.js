import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, InputBase, Menu, MenuItem, Paper } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Tune'
import SearchIcon from '@material-ui/icons/Search'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 2px',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    marginLeft: '5px',
    flex: 1
  }
}))

export const SearchBar = ({onSearch}) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)

  const isMenuOpen = Boolean(anchorEl)

  const handleFilterSettingsOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>All Attendees</MenuItem>
      <MenuItem onClick={handleMenuClose}>On this Room</MenuItem>
    </Menu>
  )

  return (
    <div>
      <Paper component='form' className={classes.root}>
        <SearchIcon color='disabled' />
        <InputBase
          className={classes.input}
          placeholder='Search by Name or Company'
          inputProps={{ 'aria-label': 'Search by name or company' }}
          onChange={onSearch}
        />
        <IconButton
          className={classes.iconButton}
          onClick={handleFilterSettingsOpen}
        >
          <MenuIcon />
        </IconButton>
      </Paper>
      {renderMenu}
    </div>
  )
}
