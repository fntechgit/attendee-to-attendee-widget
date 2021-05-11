import React from 'react'

// import style from './style.module.scss'

export const RoomsManager = ({ openDir, onBack }) => {
  const handleSearch = () => {}

  return (
    // <div className={`${style.roomsManagerWrapper} ${style[openDir]}`}>
      <div className='card'>
        <header className='card-header'>
          <a className='card-header-icon' onClick={onBack}>
            <span className='icon'>
              <i className='fa fa-arrow-left' aria-hidden='true'></i>
            </span>
          </a>
          <p className='card-header-title'>New Chat Room</p>
        </header>
        <div className='card-content'>
          <div className='content'>
            <div className='field'>
              <label className='label has-text-grey'>Name</label>
              <div className='control'>
                <input
                  className='input is-large'
                  type='text'
                  placeholder='Name your chat room'
                />
              </div>
            </div>
            <div className='field'>
              <label className='label has-text-grey'>Description</label>
              <div className='control'>
                <input
                  className='input is-large'
                  type='text'
                  placeholder='What is this room about?'
                />
              </div>
            </div>
            <div className='field'>
              <label className='label has-text-grey'>Members</label>
              <div className='control has-icons-right is-expanded'>
                <input
                  className='input is-large'
                  type='search'
                  placeholder='Search by Name'
                  onChange={handleSearch}
                />
                <span className='icon is-right'>
                  <span className='icon'>
                    <i className='fa fa-search' aria-hidden='true'></i>
                  </span>
                </span>
              </div>
            </div>
            <div className='field'>
              <label className='label has-text-grey'>Chat image</label>
              <div className='file is-large'>
                <label className='file-label'>
                  <input className='file-input' type='file' name='resume' />
                  <span className='file-cta'>
                    <span className='file-icon'>
                      <i className='fa fa-upload'></i>
                    </span>
                    <span className='file-label'>Upload</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <footer className='card-footer'>
          <a href='#' className='card-footer-item'>
            Create
          </a>
        </footer>
      </div>
    // </div>
  )
}
