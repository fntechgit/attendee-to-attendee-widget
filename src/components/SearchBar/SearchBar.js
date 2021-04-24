import React, { useState } from 'react'

export const SearchBar = ({ onSearch, onFilterModeChange }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(1)

  const toggleMenu = (event) => {
    setMenuOpen(!isMenuOpen)
  }

  const handleMenuSelection = (index) => {
    setSelectedIndex(index)
    onFilterModeChange(index)
    setTimeout(() => {
      setMenuOpen(false)
    }, 200)
  }

  return (
    <div className='field has-addons'>
      <div className='control has-icons-left is-expanded'>
        <input
          className='input is-static'
          type='search'
          placeholder='Search by name or company'
          onChange={onSearch}
        />
        <span className='icon is-left'>
          <span className='icon'>
              <i className='fa fa-search' aria-hidden='true'></i>
            </span>
        </span>
      </div>
      <div className={`dropdown is-right ${isMenuOpen ? 'is-active' : ''}`}>
        <div className='dropdown-trigger'>
          <button
            className='button is-white'
            aria-haspopup='true'
            aria-controls='search-menu'
            onClick={toggleMenu}
          >
            <span className='icon'>
              <i className='fa fa-sliders' aria-hidden='true'></i>
            </span>
          </button>
        </div>
        <div className='dropdown-menu' id='search-menu' role='menu'>
          <div className='dropdown-content'>
            <a className='dropdown-item' onClick={() => handleMenuSelection(1)}>
              <span className='icon-text has-text-weight-semibold has-text-grey'>
                <span>All Attendees</span>
                {selectedIndex === 1 && (
                  <span className='icon'>
                    <i className='fa fa-check' aria-hidden='true'></i>
                  </span>
                )}
              </span>
            </a>
            <a className='dropdown-item' onClick={() => handleMenuSelection(2)}>
              <span className='icon-text has-text-weight-semibold has-text-grey'>
                <span>On this Room</span>
                {selectedIndex === 2 && (
                  <span className='icon'>
                    <i className='fa fa-check' aria-hidden='true'></i>
                  </span>
                )}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
