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

import { useEffect, useState, useRef } from "react";

export const useStore = (props) => {
  const [attendeesNews, setAttendeesNews] = useState({});
  const [accessNews, handleAccessNews] = useState(null);
  const [accessListener, setAccessListener] = useState(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (accessNews) {
      setAttendeesNews(accessNews);
    }
  }, [accessNews, props.url]);

  useEffect(() => {
    mounted.current = true;
    if (!accessListener) {
      setAccessListener(
        props.accessRepository.subscribe((payload) => {
          if (props.summitId === payload.summit_id && mounted.current) {
            handleAccessNews(payload);
          }
        })
      );
    }
    return () => {
      mounted.current = false;
    };
  }, [accessListener]);

  return { attendeesNews };
};
