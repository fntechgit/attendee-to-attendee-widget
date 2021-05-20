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
    <div className={`${style.roomsManager}`}>
      <span className={`${style.header} icon-text`}>
        <span className={`${style.backBtn} icon`} onClick={onBack}>
          <i className='fa fa-arrow-left'></i>
        </span>
        <label className={`${style.title} label is-large`}>New Chat Room</label>
      </span>
      <Form>
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>Name</label>
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
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>
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
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>
            Members
          </label>
          <Autocomplete
            name='members'
            placeholder='Search by Name'
            dataSource={handleSearch}
            onSelect={handleSelect}
          />
        </div>
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
          <label className={`${style.fieldTitle} label is-large`}>
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
  )
}

export default withFormik({
  mapPropsToValues({
    chatRepo,
    chatClient,
    onBack,
    roomName,
    roomDesc,
    roomImg,
    members
  }) {
    return {
      chatRepo: chatRepo,
      chatClient: chatClient,
      onBack: onBack,
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
    const {
      chatRepo,
      chatClient,
      onBack,
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

      //Create channel
      const channel = await StreamChatService.createChannel(
        chatClient,
        channelTypes.CUSTOM_ROOM,
        roomName,
        roomDesc,
        memberIds,
        roomPicURL
      )
      if (!channel) {
        setErrors({ globalError: 'The room cannot be created right now' })
      } else {
        resetForm()
        onBack()
      }
    }
    setSubmitting(false)
  }
})(RoomsManager)
