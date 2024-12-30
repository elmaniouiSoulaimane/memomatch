// Popup.js
import styles from "../modules/Popup.module.css";
import React, { Component } from 'react';

class Popup extends Component {
  render() {
    const { show, onClose, children } = this.props;
    if (!show) return null;

    return (
      <div className={styles.overlay}>
        <div className={styles.popup}>
          <button className={styles.closeButton} onClick={onClose}>X</button>
          {children}
        </div>
      </div>
    );
  }
}

export default Popup;
