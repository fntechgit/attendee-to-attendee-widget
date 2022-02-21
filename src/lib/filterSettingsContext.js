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