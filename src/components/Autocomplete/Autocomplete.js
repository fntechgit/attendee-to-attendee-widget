import React from 'react'
import debounce from 'lodash.debounce'

import style from './style.module.scss'

class Autocomplete extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeIndex: 0,
      matches: [],
      query: '',
      selected: false
    }

    this.handleSearchDebounce = null

    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleSelection = this.handleSelection.bind(this)
    this.updateQuery = this.updateQuery.bind(this)
  }

  handleKeyPress(event) {
    const { activeIndex, matches } = this.state

    switch (event.which) {
      case 13: // Enter key
        if (matches.length) {
          this.setState({
            activeIndex: 0,
            matches: [],
            query: matches[activeIndex],
            selected: true
          })
        }
        break
      case 38: // Up arrow
        this.setState({
          activeIndex: activeIndex >= 1 ? activeIndex - 1 : 0
        })
        break
      case 40: // Down arrow
        this.setState({
          activeIndex:
            activeIndex < matches.length - 1
              ? activeIndex + 1
              : matches.length - 1
        })
        break
      default:
        break
    }
  }

  handleSelection(event, selection) {
    const { onSelect } = this.props
    event.preventDefault()

    this.setState({
      activeIndex: 0,
      query: selection.text,
      matches: [],
      selected: true
    })

    if (onSelect) onSelect(selection)

    this.resetState()
  }

  resetState() {
    this.setState({
      matches: [],
      query: '',
      selected: false
    })
  }

  async updateQuery(e) {
    const { dataSource } = this.props

    if (!this.state.selected) {
      const query = e.target.value

      this.setState({
        matches: [],
        query
      })

      if (this.handleSearchDebounce) this.handleSearchDebounce.cancel()
      this.handleSearchDebounce = debounce(async () => {
        const res = await dataSource(query)
        this.setState({
          matches: query.length >= 2 ? await dataSource(query) : [],
          query
        })
      }, 300)
      this.handleSearchDebounce()
    } else {
      if (e.nativeEvent.inputType === 'deleteContentBackward') {
        this.resetState()
      }
    }
  }

  render() {
    const { name, placeholder } = this.props
    const { activeIndex, matches, query } = this.state

    return (
      <div className={`dropdown ${matches.length > 0 ? 'is-active' : ''}`}>
        <div className='dropdown-trigger'>
          <div className='control has-icons-right is-expanded'>
            <input
              className='input is-large'
              type='text'
              name={name}
              value={query}
              onChange={this.updateQuery}
              onKeyDown={this.handleKeyPress}
              placeholder={placeholder}
            />
            <span className='icon is-right'>
              <span className='icon'>
                <i className='fa fa-search' aria-hidden='true'></i>
              </span>
            </span>
          </div>
        </div>
        <div className='dropdown-menu'>
          {matches.length > 0 && (
            <div className='dropdown-content'>
              {matches.map((match, index) => (
                <a
                  className={`dropdown-item ${style.autocompleteItem}`}
                  href='/'
                  key={match.value}
                  onClick={(event) => this.handleSelection(event, match)}
                >
                  <div
                    className={style.autocompleteItemContent}
                    key={`attendee-${match.value}`}
                  >
                    {match.heading && (
                      <div className={style.picWrapper}>
                        <div
                          className={style.pic}
                          style={{
                            backgroundImage: `url(${match.heading})`
                          }}
                        />
                      </div>
                    )}
                    <div className={style.textWrapper}>
                      <div className={style.title}>{match.text}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Autocomplete
