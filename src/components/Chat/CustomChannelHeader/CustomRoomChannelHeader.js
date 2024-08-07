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

import React from "react";
import { withChatContext } from "stream-chat-react";
import { channelTypes } from "../../../models/channelTypes";

import style from "./style.module.scss";

function CustomRoomChannelHeader(props) {
  // const [isMenuOpen, setMenuOpen] = useState(false);
  const { me, channel, onClose } = props;

  // const toggleMenu = () => {
  //   setMenuOpen(!isMenuOpen);
  // };

  // const handleMenuSelection = (index) => {
  //   setMenuOpen(false);
  //   if (onMenuSelected) onMenuSelected(index, channel, me);
  // };

  // const renderMoreMenu = () => (
  //   <div className={`dropdown is-right ${isMenuOpen ? "is-active" : ""}`}>
  //     <div className="dropdown-trigger">
  //       <a onClick={toggleMenu} data-tip="Chat Room Options">
  //         <div className={style.icon}>
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             height="24px"
  //             width="24px"
  //             viewBox="0 0 24 24"
  //             fill="#000000"
  //           >
  //             <path d="M0 0h24v24H0V0z" fill="none" />
  //             <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  //           </svg>
  //         </div>
  //       </a>
  //     </div>
  //     <div className="dropdown-menu" id="search-menu" role="menu">
  //       <div className="dropdown-content">
  //         <a
  //           className="dropdown-item"
  //           style={{ textDecoration: "none" }}
  //           onClick={() => handleMenuSelection(1)}
  //         >
  //           <span className="is-size-5 has-text-grey">Leave chat room</span>
  //         </a>
  //         <a
  //           className="dropdown-item mt-2"
  //           style={{ textDecoration: "none" }}
  //           onClick={() => handleMenuSelection(2)}
  //         >
  //           <span className="is-size-5 has-text-grey">Copy Invite Link</span>
  //         </a>
  //       </div>
  //     </div>
  //     <ReactTooltip place="bottom" effect="solid" multiline />
  //   </div>
  // );

  const member = Object.values(channel.state.members).find(
    (m) => m.user.id !== me.id
  );

  let headerImage = channel.data.image;
  let headerTitle = channel.data.name;
  const headerSubTitle = channel.data.description;
  // let participantsList = ''

  // if (channel.data.member_count) {
  //   headerSubTitle = `${channel.data.member_count} participants`
  //   participantsList = Object.values(channel.state.members)
  //     .map(m => m.user?.name)
  //     .sort()
  //     .join('<br>')
  // }

  if (channel.type === channelTypes.MESSAGING && member) {
    headerImage = member.user.image;
    headerTitle = member.user.name;
  }

  return (
    <div className={style.customRoomHeader}>
      <div className={style.picWrapper}>
        <div
          className={style.pic}
          style={{ backgroundImage: `url(${encodeURI(headerImage)})` }}
        />
      </div>
      <div className={style.textWrapper}>
        <span className={style.title}>{headerTitle}</span>
        {/* { headerSubTitle && <span className={style.subtitle} data-tip={participantsList}>{headerSubTitle}</span> } */}
        {headerSubTitle && (
          <span className={style.subtitle}>{headerSubTitle}</span>
        )}
      </div>
      <div className={style.controls}>
        {/* {renderMoreMenu()} */}
        <div onClick={onClose} className={style.close}>
          <svg
            width="10px"
            height="10px"
            viewBox="0 0 365.696 365.696"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default withChatContext(CustomRoomChannelHeader);
