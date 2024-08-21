import React, { Component, createRef } from 'react';
//import { Store } from 'react-notifications-component';
import styles from "../../modules/MemoryGame.module.css";
import { Store } from 'react-notifications-component';

class RoomDetailsStep extends Component {
  constructor(props) {
    super(props);
    this.mainInputRef = createRef();
    this.state = {
      roomName: '',
      errorMessage: '',
      wsConnected: false,
      isNextButtonDisabled: true,
    };
  }

  componentDidUpdate(prevProps) {
    // Check if the step has just become active
    if (!prevProps.isActive && this.props.isActive) {
      // Focus the input element if the step is now active
      if (this.mainInputRef.current) {
        this.mainInputRef.current.focus();
      }
    }
  }
  
  validateInput = (event) => {
    const { value } = event.target;
    const regex = /^[a-zA-Z0-9_-]*$/;

    if (regex.test(value)) {
      this.setState({
        roomName: value,
        errorMessage: '',
        isNextButtonDisabled: false,
        wsConnected: false
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
      if (this.state.wsConnected === false) {
        let ws = null
        if (this.props.isRoomAdmin) {
          ws = new WebSocket(process.env.REACT_APP_API_HOST + `/create/${this.state.roomName}`);
        }else{
          ws = new WebSocket(process.env.REACT_APP_API_HOST + `/join/${this.state.roomName}`);
        }

        ws.onopen = (success) => {
          console.log("Websocket connection opened")

          this.props.setRoomName(this.state.roomName)
          this.props.setWebSocket(ws);
          this.setState({ wsConnected: true });
        };

        ws.onerror = (error) => {
          console.log("In error")
          Store.addNotification({
            title: "Error",
            message: error.message || "An unknown error occurred",
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          })
        }


      }else{
        this.props.nextStep();
      }
    }
  }

  previousStep = () => {
    //set input value to empty string
    this.setState({
      roomName: '',
      errorMessage: '',
      isNextButtonDisabled: true
    });

    this.props.previousStep();
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
              ref={this.mainInputRef}
              onChange={this.validateInput}
              value={this.state.roomName}
            />
          </div>
          {this.state.errorMessage && <p style={{ color: 'red' }}>{this.state.errorMessage}</p>}

          <div className={styles.btnsContainer}>
            <button onClick={this.previousStep} className={styles.prevBtn}>Previous</button>
            <button onClick={this.handleClick} className={styles.nextBtn} disabled={this.state.isNextButtonDisabled}>Next</button>
          </div>
        </div>
      </>
    );
  }
}

export default RoomDetailsStep