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

import { HTTP_400, HTTP_422 } from "./constants";

const validate = (email, password) => {
  if (!email) return "Email is required";
  if (!password) return "Password is required";
  return null;
};

export const signIn = async (supabase, email, password) => {
  const hasErrors = validate(email, password);
  if (hasErrors) throw new Error(hasErrors);

  const { data } = await supabase.auth.signIn({
    email,
    password
  });
  return data.user;
};

export const signUp = async (supabase, email, password) => {
  const hasErrors = validate(email, password);
  if (hasErrors) throw new Error(hasErrors);

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    if ([HTTP_400, HTTP_422].includes(error.status)) {
      // User already registered
      return await signIn(supabase, email, password);
    }
    throw new Error(error);
  }
  return data.user;
};

export const signOut = async (supabase) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error trying signout user");
  }
};
