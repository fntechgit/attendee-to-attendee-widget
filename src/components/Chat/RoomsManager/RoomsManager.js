import React, { useState } from 'react'
import Autocomplete from '../../Autocomplete/Autocomplete'

export const RoomsManager = ({ onBack, accessRepo }) => {
  const handleSearch = async (query) => {
    return (await accessRepo.findByFullName(query)).map((item) => {
      return {
        value: item.id,
        text: item.full_name,
        heading: item.pic_url
      }
    })
  }

  const buildAttendeePill = () => {
    return (
      <div className={style.autocompleteItem}>
        <div
          className={style.autocompleteItemContent}
          key={`attendee-${match.value}`}
        >
          <div className={style.picWrapper}>
            <div
              className={style.pic}
              style={{
                backgroundImage: `url(${match.heading})`
              }}
            />
          </div>
          <div className={style.textWrapper}>
            <div className={style.title}>{match.text}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
            <label className='label is-large has-text-grey'>Name</label>
            <div className='control'>
              <input
                className='input is-large'
                type='text'
                placeholder='Name your chat room'
              />
            </div>
          </div>
          <div className='field'>
            <label className='label is-large has-text-grey'>Description</label>
            <div className='control'>
              <input
                className='input is-large'
                type='text'
                placeholder='What is this room about?'
              />
            </div>
          </div>
          <Autocomplete
            name='members'
            label='Members'
            placeholder='Search by Name'
            dataSource={handleSearch}
          />
          <div>
            
          </div>
          <div className='field'>
            <label className='label is-large has-text-grey'>Chat image</label>
            <div className='file is-large'>
              <label className='file-label'>
                <input className='file-input' type='file' name='roomImg' />
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
  )
}
