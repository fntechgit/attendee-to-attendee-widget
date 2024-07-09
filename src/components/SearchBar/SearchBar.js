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

import React, { useState } from "react";

import style from "./style.module.scss";

let charsCount = 0;

export function SearchBar({
  onSearch,
  onClear,
  onFilterModeChange,
  filterMenuOptions,
  defaultMenuIx,
  placeholder
}) {
  const [searchPrefix, setSearchPrefix] = useState("");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultMenuIx ?? 1);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleMenuSelection = (index) => {
    const timeout = 200;
    setSearchPrefix("");
    setSelectedIndex(index);
    onFilterModeChange(index);
    setTimeout(() => {
      setMenuOpen(false);
    }, timeout);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchPrefix(value);
    if (onClear && charsCount > 0 && value.length === 0) {
      onClear();
    }
    charsCount = value.length;
    if (onSearch) {
      onSearch(e);
    }
  };

  return (
    <div className={`field has-addons ${style.searchBar}`}>
      <div className="control has-icons-left is-expanded">
        <input
          className="input is-medium"
          type="search"
          value={searchPrefix}
          placeholder={placeholder || "Search by name or company"}
          onChange={handleSearch}
        />
        <span className="icon is-left">
          <span className="icon">
            <i className="fa fa-search" aria-hidden="true" />
          </span>
        </span>
      </div>
      {filterMenuOptions && (
        <div className={`dropdown is-right ${isMenuOpen ? "is-active" : ""}`}>
          <div className="dropdown-trigger">
            <button
              className={`button is-medium ${style.filterButton}`}
              type="button"
              aria-haspopup="true"
              aria-controls="search-menu"
              onClick={toggleMenu}
            >
              <span className="icon">
                <i className="fa fa-sliders" aria-hidden="true" />
              </span>
            </button>
          </div>
          <div
            className={`dropdown-menu ${style.dropdownMenu}`}
            id="search-menu"
            role="menu"
          >
            <div className={`dropdown-content ${style.dropdownContent}`}>
              {filterMenuOptions.map((item, ix) => (
                <a
                  className="dropdown-item mt-2 pr-0"
                  key={item}
                  onClick={() => handleMenuSelection(ix)}
                >
                  <span className="icon-text is-size-5">
                    <span>{item}</span>
                    {selectedIndex === ix && (
                      <span className="icon">
                        <i className="fa fa-check" aria-hidden="true" />
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
  );
}
