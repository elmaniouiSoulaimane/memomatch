import React from "react";
import { Store } from 'react-notifications-component';
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
        ws = new WebSocket(`ws://127.0.0.1:8000/ws/memomatch/${this.state.roomName}/?action=create`);
      }else{
        ws = new WebSocket(`ws://127.0.0.1:8000/ws/memomatch/${this.state.roomName}/?action=join`);
      }
      
      
      ws.onopen = () => {
        this.setState({ wsConnected: true }, () => {
          this.props.setRoomName(this.state.roomName)
          this.props.setWebSocket(ws);

          // const roomName = this.state.roomName
          // const errorMessage = this.state.errorMessage
          // const wsConnected = this.state.wsConnected

          //NOTIFICATION
          let notifTitle = ""

          if (this.props.isRoomAdmin){
            notifTitle = "Room created successfully!"

          }else{
            notifTitle = "You joined the room successfully!"
          }

          Store.addNotification({
            title: notifTitle,
            message: '',
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
          });

          this.props.nextStep();
        });
      };

      ws.onerror = (error) => {

        //NOTIFICATION
        let notifTitle = ""
        let notifMsg = ""

        console.log("isRoomAdmin = " + this.props.isRoomAdmin)

        if (this.props.isRoomAdmin){
          notifTitle = "Room creation failed!"
          notifMsg = "There was an issue connecting with the server."

        }else{
          notifTitle = "Room joining failed!"
          notifMsg = "There was an issue connecting with the server."
        }


        Store.addNotification({
          title: notifTitle,
          message: notifMsg,
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