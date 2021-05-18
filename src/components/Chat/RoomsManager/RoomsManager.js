import React, { useState } from 'react'
import { withFormik, Form, Field } from 'formik'
import * as Yup from 'yup'
import Autocomplete from '../../Autocomplete/Autocomplete'
import AttendeePill from '../AttendeePill/AttendeePill'
import StreamChatService from '../../../lib/services/StreamChatService'
import { channelTypes } from '../../../models/channel_types'

import style from './style.module.scss'

const RoomsManager = (props) => {
  const {
    onBack,
    accessRepo,
    chatRepo,
    chatClient,
    errors,
    touched,
    isSubmitting,
    setFieldValue
  } = props

  const [selectedAttendees, setSelectedAttendees] = useState([])
  const [selectedImageFileName, setSelectedImageFileName] = useState(null)

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
    const members = [...selectedAttendees, selection]
    setSelectedAttendees(members)
    setFieldValue('members', members)
  }

  const dismissSelection = (id) => {
    setSelectedAttendees(selectedAttendees.filter((item) => item.value !== id))
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    setFieldValue('roomImg', file)
    setSelectedImageFileName(file.name)
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
              <label className='label is-large has-text-grey mb-4'>Name</label>
              <div className='control'>
                <Field
                  className='input is-large'
                  type='text'
                  maxLength='20'
                  name='roomName'
                  placeholder='Name your chat room'
                />
                {touched.roomName && errors.roomName && (
                  <p className='has-text-danger'>{errors.roomName}</p>
                )}
              </div>
            </div>
            <div className='field'>
              <label className='label is-large has-text-grey mb-4'>
                Description
              </label>
              <div className='control'>
                <Field
                  className='input is-large'
                  type='text'
                  maxLength='50'
                  name='roomDesc'
                  placeholder='What is this room about?'
                />
                {touched.roomDesc && errors.roomDesc && (
                  <p className='has-text-danger'>{errors.roomDesc}</p>
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
              <label className='label is-large has-text-grey mb-4'>
                Chat image
              </label>
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
                  {selectedImageFileName && (
                    <span className='file-name'>{selectedImageFileName}</span>
                  )}
                </label>
              </div>
            </div>
            <button
              type='submit'
              className='button is-primary is-large is-fullwidth mt-6'
              disabled={isSubmitting}
            >
              Create
            </button>
            {errors.globalError && (
              <p className='has-text-danger mt-1'>{errors.globalError}</p>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}

export default withFormik({
  mapPropsToValues({
    chatRepo,
    chatClient,
    roomName,
    roomDesc,
    roomImg,
    members
  }) {
    return {
      chatRepo: chatRepo,
      chatClient: chatClient,
      roomName: roomName || '',
      roomDesc: roomDesc || '',
      roomImg: roomImg || '',
      members: members || []
    }
  },
  validationSchema: Yup.object().shape({
    roomName: Yup.string()
      .min(3, 'Room name must be 3 characters or longer')
      .required('Room name is required'),
    roomDesc: Yup.string()
      .min(5, 'Room description must be 5 characters or longer')
      .required('Room description is required')
  }),
  async handleSubmit(values, { resetForm, setErrors, setSubmitting }) {
    // setTimeout(() => {
    //   if (values.roomName === 'test') {
    //     setErrors({ roomName: 'That room name is already taken' })
    //   } else {
    //     resetForm()
    //   }
    //   setSubmitting(false)
    // }, 2000)

    //TODO: Check if room exists

    const {
      chatRepo,
      chatClient,
      roomName,
      roomDesc,
      roomImg,
      members
    } = values

    if (!chatClient) {
      setErrors({ globalError: 'The room cannot be created right now' })
    } else {
      let roomPicURL

      if (roomImg) {
        const res = await chatRepo.uploadRoomImage(
          `${roomName}_${roomImg.name}`,
          roomImg
        )
        roomPicURL = res?.signedURL
      }

      const memberIds = members.map((m) => `${m.value}`)

      console.log('chatClient', chatClient)
      console.log('roomName', roomName)
      console.log('roomDesc', roomDesc)
      console.log('roomImg', roomImg)
      console.log('members', memberIds)
      console.log('image url', roomPicURL)

      //Create channel
      StreamChatService.createChannel(
        chatClient,
        channelTypes.CUSTOM_ROOM,
        roomName,
        roomDesc,
        memberIds,
        roomPicURL
      )

      resetForm()
    }
    setSubmitting(false)
  }
})(RoomsManager)
