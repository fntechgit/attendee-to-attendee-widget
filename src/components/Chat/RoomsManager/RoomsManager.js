import React, { useState } from 'react'
import { withFormik, Form, Field } from 'formik'
import * as Yup from 'yup'
import Autocomplete from '../../Autocomplete/Autocomplete'
import AttendeePill from '../AttendeePill/AttendeePill'

import style from './style.module.scss'

const RoomsManager = (props) => {
  const { onBack, accessRepo, errors, touched, isSubmitting } = props

  const [selectedAttendees, setSelectedAttendees] = useState([])
  const [selectedFileName, setSelectedFileName] = useState(null)

  const handleSearch = async (query) => {
    return (await accessRepo.findByFullName(query)).map((item) => {
      return {
        value: item.idp_user_id,
        text: item.full_name,
        heading: item.pic_url
      }
    })
  }

  const handleSelect = (selection) => {
    setSelectedAttendees([...selectedAttendees, selection])
  }

  const dismissSelection = (id) => {
    setSelectedAttendees(selectedAttendees.filter((item) => item.value !== id))
  }

  const handleFileChange = event => {
    const fileInfo = event.target.files[0]
    setSelectedFileName(fileInfo.name)
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
          <Form>
            <div className='field'>
              <label className='label is-large has-text-grey'>Name</label>
              <div className='control'>
                <Field
                  className='input is-large'
                  type='text'
                  maxLength='20'
                  name='roomname'
                  placeholder='Name your chat room'
                />
                {touched.roomname && errors.roomname && (
                  <p className='has-text-danger'>{errors.roomname}</p>
                )}
              </div>
            </div>
            <div className='field'>
              <label className='label is-large has-text-grey'>
                Description
              </label>
              <div className='control'>
                <Field
                  className='input is-large'
                  type='text'
                  maxLength='50'
                  name='roomdesc'
                  placeholder='What is this room about?'
                />
                {touched.roomdesc && errors.roomdesc && (
                  <p className='has-text-danger'>{errors.roomdesc}</p>
                )}
              </div>
            </div>
            <Autocomplete
              name='members'
              label='Members'
              placeholder='Search by Name'
              dataSource={handleSearch}
              onSelect={handleSelect}
            />
            <div className={style.selectedAttendees}>
              {selectedAttendees &&
                selectedAttendees.map((item, ix) => (
                  <AttendeePill
                    key={ix}
                    attendee={{
                      id: item.value,
                      full_name: item.text,
                      pic_url: item.heading
                    }}
                    onClose={dismissSelection}
                  />
                ))}
            </div>
            <div className='field'>
              <label className='label is-large has-text-grey'>Chat image</label>
              <div className='file is-large has-name'>
                <label className='file-label'>
                  <input
                    className='file-input'
                    type='file'
                    name='roomimg'
                    onChange={handleFileChange}
                  />
                  <span className='file-cta'>
                    <span className='file-icon'>
                      <i className='fa fa-upload'></i>
                    </span>
                    <span className='file-label'>Upload</span>
                  </span>
                  {selectedFileName && (
                    <span className='file-name'>{selectedFileName}</span>
                  )}
                </label>
              </div>
            </div>
            <button
              className='button is-primary is-large is-fullwidth'
              disabled={isSubmitting}
            >
              Create
            </button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default withFormik({
  mapPropsToValues({ roomname, roomdesc }) {
    return {
      roomname: roomname || '',
      roomdesc: roomdesc || ''
    }
  },
  validationSchema: Yup.object().shape({
    roomname: Yup.string()
      .min(3, 'Room name must be 3 characters or longer')
      .required('Room name is required'),
    roomdesc: Yup.string()
      .min(5, 'Room description must be 5 characters or longer')
      .required('Room description is required')
  }),
  handleSubmit(values, { resetForm, setErrors, setSubmitting }) {
    setTimeout(() => {
      if (values.roomname === 'test') {
        setErrors({ roomname: 'That room name is already taken' })
      } else {
        resetForm()
      }
      setSubmitting(false)
    }, 2000)
  }
})(RoomsManager)
