import React from "react";
import styles from "../../modules/MemoryGame.module.css";

class PlayersNumberStep extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        playersNbr: '',
        errorMessage: '',
        isNextButtonDisabled: true
      };
    }
  
    validateInput = (event) => {
      const { value } = event.target;
      const regex = /^[0-9]*$/;
      if (regex.test(value)) {
        this.setState({
          inputValue: value,
          errorMessage: '',
          isNextButtonDisabled: false
        });
      } else {
        this.setState({
          errorMessage: 'Only numbers are allowed!',
          isNextButtonDisabled: true
        });
      }
    };
  
  
    render() {
      return (
        <div className={styles.step}>
          <div className={styles.formContainer}> 
            <span>How many players are going to join:</span>
            <input
            type="text"
            onChange={this.validateInput}
            />
          </div>
          {this.state.errorMessage && <p style={{ color: 'red' }}>{this.state.errorMessage}</p>}
          <div className={styles.btnsContainer}>
            <button onClick={this.props.previousStep} className={styles.prevBtn}>Previous</button>
            <button onClick={this.props.nextStep} className={styles.nextBtn} disabled={this.state.isNextButtonDisabled}>Next</button>
          </div>
        </div>
      );
    }
}

export default PlayersNumberStep
