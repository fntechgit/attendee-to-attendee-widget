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
 **/

import React, { useContext, useState } from 'react'

const FilterSettingsContext = React.createContext()
const FilterSettingsUpdateContext = React.createContext()

export function useFilterSettings() {
    return useContext(FilterSettingsContext)
}

export function useUpdateFilterSettings() {
    return useContext(FilterSettingsUpdateContext)
}

export const FilterSettingsProvider = ({children, defaultScope}) => {
    const [filterMode, setFilterMode] = useState(defaultScope)

    const updateFilterMode = (mode) => {
        setFilterMode(mode)
    }

    return (
        <FilterSettingsContext.Provider value={filterMode}>
            <FilterSettingsUpdateContext.Provider value={updateFilterMode}>
                {children}
            </FilterSettingsUpdateContext.Provider>
        </FilterSettingsContext.Provider>
    )
}