import React  from "react";
import styles from './style.module.scss';

const User = ({user, children}) => {
  const statusClass = user.online ? styles.online : styles.offline;
  return (
    <div className={`${styles.channelPreview} ${statusClass}`}>
        <div className={styles.pic}>
            <img src={user.image} alt="" />
            <div className={styles.status} />
        </div>
        <div className={styles.info}>
            {children}
        </div>
    </div>
  );
};

export default User;
