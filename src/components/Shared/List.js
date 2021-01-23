import React from 'react';
import PropTypes from 'prop-types';
import styles from "../../styles/styles.module.scss"

const List = (props) => {
    const ComponentToRender = props.component;
    let content = <div />;
  
    // If we have items, render them
    if (props.items) {
      content = props.items.map(item => (
        <ComponentToRender key={`item-${item.id}`} item={item} />
      ));
    } else {
      // Otherwise render a single component
      content = <ComponentToRender />;
    }
  
    return (
        <div className={styles.outerWrapper}>
            <ul className={styles.attendeesList}>{content}</ul>
        </div>
    );
  }
  
  List.propTypes = {
    component: PropTypes.elementType.isRequired,
    items: PropTypes.array,
  };
  
  export default List;