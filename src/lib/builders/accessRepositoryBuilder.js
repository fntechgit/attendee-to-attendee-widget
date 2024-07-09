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

import AccessRepository from "../repository/AccessRepository";
import SupabaseClientBuilder from "./supabaseClientBuilder";

export default class AccessRepositoryBuilder {
  static repo;

  static getRepository(
    supabaseUrl,
    supabaseKey,
    subscribeToRealTime,
    summitId
  ) {
    if (!this.repo) {
      this.repo = new AccessRepository(
        SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
        subscribeToRealTime,
        summitId
      );
    }
    return this.repo;
  }
}
