import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons'

export const SearchBar = ({ onSearch }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)

  const toggleMenu = (event) => {
    setMenuOpen(!isMenuOpen)
  }

  const handleMenuSelection = () => {
    setMenuOpen(false)
  }

  return (
    <div>
      <div className='container'>
        <div className='field has-addons'>
          <div className='control has-icons-left'>
            <div className='control has-icons-left'>
              <input
                className='input'
                type='search'
                placeholder='Search by name or company'
              />
              <span className='icon is-left'>
                <FontAwesomeIcon icon={faSearch} />
              </span>
            </div>
          </div>
          <div className={`dropdown ${isMenuOpen ? 'is-active' : ''}`}>
            <div className='dropdown-trigger'>
              <button
                className='button'
                aria-haspopup='true'
                aria-controls='dropdown-menu2'
                onClick={toggleMenu}
              >
                <FontAwesomeIcon icon={faSlidersH} />
              </button>
            </div>
            <div className='dropdown-menu' id='dropdown-menu2' role='menu'>
              <div className='dropdown-content'>
                <a className='dropdown-item' onClick={handleMenuSelection}>
                  All Attendees
                </a>
                <hr className='dropdown-divider' />
                <a className='dropdown-item' onClick={handleMenuSelection}>
                  On this Room
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
