import React from "react";
//import { Store } from 'react-notifications-component';
import styles from "../../modules/MemoryGame.module.css";

class RoomDetailsStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: '',
      errorMessage: '',
      wsConnected: false,
      isNextButtonDisabled: true,
    };
  }

  validateInput = (event) => {
    const { value } = event.target;
    const regex = /^[a-zA-Z0-9_-]*$/;

    if (regex.test(value)) {
      this.setState({
        roomName: value,
        errorMessage: '',
        isNextButtonDisabled: false
      });

    } else {
      this.setState({
        errorMessage: 'Only normal characters, numbers, and underscores are allowed.',
        isNextButtonDisabled: true
      });
    }
  }
 
  handleClick = () => {
    if (this.state.roomName !== '' && this.state.errorMessage === ''){
      let ws = null
      if (this.props.isRoomAdmin) {
        ws = new WebSocket(process.env.REACT_APP_API_HOST + `/create/${this.state.roomName}`);
      }else{
        ws = new WebSocket(process.env.REACT_APP_API_HOST + `/join/${this.state.roomName}`);
      }

      //WEBSOCKET
      ws.onopen = () => {
        this.props.setRoomName(this.state.roomName)
        this.props.setWebSocket(ws);
      };
    }
  }

  render() {
    return (
      <>
        <div className={styles.step}>
          <h2>Step 2: Share Room name</h2>
          <div className={styles.formContainer}> 
            <span>Please provide the room's name: </span>
            <input
              type="text"
              onChange={this.validateInput}
            />
          </div>
          {this.state.errorMessage && <p style={{ color: 'red' }}>{this.state.errorMessage}</p>}

          <div className={styles.btnsContainer}>
            <button onClick={this.props.previousStep} className={styles.prevBtn}>Previous</button>
            <button onClick={this.handleClick} className={styles.nextBtn} disabled={this.state.isNextButtonDisabled}>Next</button>
          </div>
        </div>
      </>
    );
  }
}

export default RoomDetailsStep