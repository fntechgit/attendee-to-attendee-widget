import React, { useContext, useState } from 'react'

const AttendeesNewsContext = React.createContext()
const AttendeesNewsUpdateContext = React.createContext()

export function useAttendeesNews() {
    return useContext(AttendeesNewsContext)
}

export function useUpdateAttendeesNews() {
    return useContext(AttendeesNewsUpdateContext)
}

export const AttendeesNewsProvider = ({children}) => {
    const [attendeesList, setAttendeesList] = useState([])

    const updateAttendeesList = (list) => {
        setAttendeesList(list)
    }

    return (
        <AttendeesNewsContext.Provider value={attendeesList}>
            <AttendeesNewsUpdateContext.Provider value={updateAttendeesList}>
                {children}
            </AttendeesNewsUpdateContext.Provider>
        </AttendeesNewsContext.Provider>
    )
}