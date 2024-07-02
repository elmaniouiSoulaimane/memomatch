import React from "react";
import styles from "../../modules/MemoryGame.module.css";

class FirstStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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
        <div className={styles.btnsContainer}>
          <button className={styles.btn} onClick={this.handleCreateRoom} id={styles.newRoom}>Create a Room</button>
          <button className={styles.btn} onClick={this.handleJoinRoom} id={styles.joinRoom}>Join a Room</button>
        </div>
      </div>
    );
  }
}

export default FirstStep