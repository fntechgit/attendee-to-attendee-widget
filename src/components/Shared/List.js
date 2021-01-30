import React from 'react';
import PropTypes from 'prop-types';

const List = (props) => {
    const ComponentToRender = props.component;
    const style = props.style;
    let content = <div />;
  
    // If we have items, render them
    if (props.items) {
      content = props.items.map(item => (
        <ComponentToRender key={`item-${item.id}`} item={item} {...props} />
      ));
    } else {
      // Otherwise render a single component
      content = <ComponentToRender {...props} />;
    }
  
    return (
        <div className={style.outerWrapper}>
            <ul className={style.attendeesList}>{content}</ul>
        </div>
    );
  }
  
  List.propTypes = {
    component: PropTypes.elementType.isRequired,
    items: PropTypes.array,
  };
  
  export default List;