/**
 * Copyright 2021 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React, { useState } from "react";
import { withFormik, Form, Field } from "formik";
import * as Yup from "yup";
import Autocomplete from "../../Autocomplete/Autocomplete";
import AttendeePill from "../AttendeePill/AttendeePill";
import { channelTypes } from "../../../models/channelTypes";

import style from "./style.module.scss";
import { nameToId } from "../../../utils/stringHelper";

function RoomsManager(props) {
  const { onBack, accessRepo, errors, touched, isSubmitting, setFieldValue } =
    props;

  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [selectedImageFileName, setSelectedImageFileName] = useState(null);

  const handleSearch = async (query) =>
    (await accessRepo.findByNameOrCompany(query)).map((item) => ({
      value: item.idp_user_id,
      text: item.full_name,
      heading: item.pic_url
    }));

  const handleSelect = (selection) => {
    const members = [...selectedAttendees, selection];
    setSelectedAttendees(members);
    setFieldValue("members", members);
  };

  const dismissSelection = (id) => {
    setSelectedAttendees(selectedAttendees.filter((item) => item.value !== id));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFieldValue("roomImg", file);
    setSelectedImageFileName(file.name);
  };

  return (
    <div className={`${style.roomsManager}`}>
      <span className={style.header}>
        <span className={style.backBtn} onClick={onBack}>
          <i className="fa fa-arrow-left" />
        </span>
        <label className={`${style.title} label is-large`}>New Chat Room</label>
      </span>
      <Form>
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>Name</label>
          <div className={`${style.fieldInput} control`}>
            <Field
              className="input is-large"
              type="text"
              maxLength="20"
              name="roomName"
              placeholder="Name your chat room"
            />
            {touched.roomName && errors.roomName && (
              <p className="has-text-danger">{errors.roomName}</p>
            )}
          </div>
        </div>
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>
            Description
          </label>
          <div className={`${style.fieldInput} control`}>
            <Field
              className="input is-large"
              type="text"
              maxLength="50"
              name="roomDesc"
              placeholder="What is this room about?"
            />
            {touched.roomDesc && errors.roomDesc && (
              <p className="has-text-danger">{errors.roomDesc}</p>
            )}
          </div>
        </div>
        <div className={`${style.field} field`}>
          <label className={`${style.fieldTitle} label is-large`}>
            Members
          </label>
          <div className={`${style.fieldInput}`}>
            <Autocomplete
              name="members"
              placeholder="Search by Name"
              dataSource={handleSearch}
              onSelect={handleSelect}
            />
          </div>
        </div>
        <div className={style.selectedAttendees}>
          {selectedAttendees &&
            selectedAttendees.map((item) => (
              <AttendeePill
                key={item.value}
                attendee={{
                  id: item.value,
                  full_name: item.text,
                  pic_url: item.heading
                }}
                onClose={dismissSelection}
              />
            ))}
        </div>
        <div className="field">
          <label className={`${style.fieldTitle} label is-large`}>
            Chat image
          </label>
          <div className={`${style.fieldInput} file is-large has-name`}>
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="roomimg"
                onChange={handleFileChange}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fa fa-upload" />
                </span>
                <span className="file-label">Upload</span>
              </span>
              {selectedImageFileName && (
                <span className="file-name">{selectedImageFileName}</span>
              )}
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="button is-primary is-large is-fullwidth mt-6"
          disabled={isSubmitting}
        >
          Create
        </button>
        {errors.globalError && (
          <p className="has-text-danger mt-1">{errors.globalError}</p>
        )}
      </Form>
    </div>
  );
}

const roomNameMinChars = 3;
const roomDescMinChars = 5;

export default withFormik({
  mapPropsToValues({ chatRepo, onBack, roomName, roomDesc, roomImg, members }) {
    return {
      chatRepo,
      onBack,
      roomName: roomName || "",
      roomDesc: roomDesc || "",
      roomImg: roomImg || "",
      members: members || []
    };
  },
  validationSchema: Yup.object().shape({
    roomName: Yup.string()
      .min(
        roomNameMinChars,
        `Room name must be ${roomNameMinChars} characters or longer`
      )
      .required("Room name is required"),
    roomDesc: Yup.string()
      .min(
        roomDescMinChars,
        `Room description must be ${roomDescMinChars} characters or longer`
      )
      .required("Room description is required")
  }),
  async handleSubmit(values, { resetForm, setErrors, setSubmitting }) {
    const { chatRepo, onBack, roomName, roomDesc, roomImg, members } = values;

    let roomPicURL;

    const roomId = nameToId(roomName);

    if (roomImg) {
      const res = await chatRepo.uploadRoomImage(
        `${roomId}_${roomImg.name}`,
        roomImg
      );
      roomPicURL = res?.signedURL;
    }

    const memberIds = members.map((m) => `${m.value}`);

    // Create room
    const channel = await chatRepo.createRoom(
      channelTypes.CUSTOM_ROOM,
      roomName,
      roomDesc,
      memberIds,
      roomPicURL
    );
    if (!channel) {
      setErrors({ globalError: "The room cannot be created right now" });
    } else {
      resetForm();
      onBack();
    }
    setSubmitting(false);
  }
})(RoomsManager);
