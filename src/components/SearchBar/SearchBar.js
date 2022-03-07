import React, { useState } from 'react'

let charsCount = 0

export const SearchBar = ({
  onSearch,
  onClear,
  onFilterModeChange,
  filterMenuOptions,
  defaultMenuIx,
  placeholder
}) => {
  const [searchPrefix, setSearchPrefix] = useState('')
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(defaultMenuIx ?? 1)

  const toggleMenu = (event) => {
    setMenuOpen(!isMenuOpen)
  }

  const handleMenuSelection = (index) => {
    setSearchPrefix('')
    setSelectedIndex(index)
    onFilterModeChange(index)
    setTimeout(() => {
      setMenuOpen(false)
    }, 200)
  }

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchPrefix(value)
    if (onClear && charsCount > 0 && value.length === 0) {
      onClear()
    }
    charsCount = value.length
    if (onSearch) {
      onSearch(e)
    }
  }

  return (
    <div className='field has-addons'>
      <div className='control has-icons-left is-expanded'>
        <input
          className='input is-medium'
          type='search'
          value={searchPrefix}
          placeholder={placeholder || 'Search by name or company'}
          onChange={handleSearch}
        />
        <span className='icon is-left'>
          <span className='icon'>
            <i className='fa fa-search' aria-hidden='true'></i>
          </span>
        </span>
      </div>
      {filterMenuOptions && (
        <div className={`dropdown is-right ${isMenuOpen ? 'is-active' : ''}`}>
          <div className='dropdown-trigger'>
            <button
              className='button is-medium'
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
              {filterMenuOptions.map((item, ix) => (
                <a
                  className='dropdown-item mt-2 pr-0'
                  style={{ textDecoration: 'none' }}
                  key={ix}
                  href='#;'
                  onClick={() => handleMenuSelection(ix)}
                >
                  <span className='icon-text is-size-5 has-text-grey'>
                    <span>{item}</span>
                    {selectedIndex === ix && (
                      <span className='icon'>
                        <i className='fa fa-check' aria-hidden='true'></i>
                      </span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
