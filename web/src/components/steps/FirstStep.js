import React from "react";
import styles from "../../modules/MemoryGame.module.css";

class FirstStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleCreateRoom = () => {
    console.log("In handleCreateRoom")
    this.props.setIsRoomAdmin(true);
    this.props.goToStep(2);
  };

  handleJoinRoom = () => {
    console.log("In handleJoinRoom")
    this.props.setIsRoomAdmin(false);
    this.props.goToStep(2);
  };
  
  render() {
    return (
      <div className={styles.step}>
        <div className={styles.introduction}>
          <h2>About This Project:</h2>
          <p>Welcome to the Memory Cards Game! This project was built to showcase the power of real-time communication using WebSockets. Unlike traditional HTTP requests that require constant refreshing, WebSockets allow for instant, two-way interaction between the server and the browser. The goal of this game is not just to entertain, but to demonstrate how modern web applications can provide a smooth, dynamic user experience with live updates. The backend is powered by Django and Python, while the frontend is built with React, all working together to create a fast and responsive game environment.</p>
          <div className={styles.btnsContainer}>
            <button className={styles.btn} onClick={this.handleCreateRoom} id={styles.newRoom}>Create a Room</button>
            <button className={styles.btn} onClick={this.handleJoinRoom} id={styles.joinRoom}>Join a Room</button>
          </div>
        </div>
      </div>
    );
  }
}

export default FirstStep