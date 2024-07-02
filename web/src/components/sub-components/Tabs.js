import React, { Component } from 'react';
import styles from "../../modules/Room.module.css"
import {Cards_Back, cardFlipSound, success} from "../../imports"

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePlayerIndex: 0,
      flippedCards: [],
      audioRefs: [
        React.createRef(),
        React.createRef(),
      ],
      audios: [
        cardFlipSound,
        success
      ]
    };
  }

  handleTabClick = (playerIndex) => {
    this.setState({ activePlayerIndex: playerIndex });
  };

  handleCardClick = (index) => {
    console.log("You clicked on handleCardClick")

    //PROPS
    const players = this.props.players
    const setPlayers = this.props.setPlayers

    //STATE
    const activePlayerIndex = this.state.activePlayerIndex
    const flippedCards = this.state.flippedCards
    const currentCard = players[activePlayerIndex].cards[index];

    //LOCALS
    let update = ""

    this.playSound(0)

    
    if (!currentCard.flipped && flippedCards.length < 2) {
      
      //UPDATE PLAYER FLIPPED CARD STATUS
      const updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex].cards[index].flipped = true;
      
      const newFlippedCards = [...flippedCards, {"card": currentCard, "index":index}];
      this.setState({ flippedCards: newFlippedCards });

      update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " card."

      if (newFlippedCards.length === 2) {
        // console.log("===> two")

        
        const [obj1, obj2] = newFlippedCards;
        
        // Matching cards
        if (obj1.card.name === obj2.card.name) {
          setTimeout(() => {
            this.playSound(1)
          }, 800);
          
          updatedPlayers[activePlayerIndex].points += 20;
          update = "Player " + players[activePlayerIndex].user_name + " flipped two " + currentCard.name + " cards!  +20Pts"
          
        } else { // Not matching cards

          //console.log("updatedPlayers = " + JSON.stringify(updatedPlayers))
          const card1 = updatedPlayers[activePlayerIndex].cards[obj1.index]
          const card2 = updatedPlayers[activePlayerIndex].cards[obj2.index]
          
          const resetCards = [card1, card2];

          setTimeout(() => {
            resetCards.forEach(card => {
              card.flipped = false;
            });
          }, 1500);

          update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " a non-matching card, no points."

        } 
        
        this.setState({ 
          flippedCards: []
        });
      }

      setTimeout(() => {
        setPlayers(updatedPlayers);
      }, 1500);

      this.props.ws.send(
        JSON.stringify(
          { 
            "event":"player-moved", 
            "update": update,
            "player": updatedPlayers[activePlayerIndex]
          }
        )
      );

    } else if (!currentCard.flipped && flippedCards.length === 2) {
        console.log("oops you clicked on a third!")

        const updatedPlayers = [...players];
        updatedPlayers[activePlayerIndex].cards[index].flipped = true;
                
        const [obj1, obj2] = flippedCards;

        const card1 = updatedPlayers[activePlayerIndex].cards[obj1.index]
        const card2 = updatedPlayers[activePlayerIndex].cards[obj2.index]

        const resetCards = [card1, card2];

        resetCards.forEach(card => {
          card.flipped = false;
        });

        this.setState({ 
          flippedCards: [{"card": currentCard, "index":index}]
        });

        setPlayers(updatedPlayers);
    }
  };

  playSound = (index) => {
    this.state.audioRefs[index].current.play();
  };

  render(){
    const players = this.props.players
    const mainPlayer = this.props.mainPlayer
    const activePlayerIndex = this.state.activePlayerIndex

    return (
      
      <div>
        <div className={styles.tabs}>
          {players.map((player, index) => (
            <button
              key={index}
              onClick={() => this.handleTabClick(index)}
              className={activePlayerIndex === index ? styles.activeTab : styles.tab}
            >
              <img src={player.avatar} alt={player.user_name}/>
              <span>{player.user_name}</span>
            </button>
          ))}
        </div>

        {/* Render content based on active player */}
        <div className={styles.cardsContainer}>

          {players[activePlayerIndex]?.cards.map((card, index) => (

            <button 
              key={index} 
              className={`${styles.card} ${card.flipped ? styles.flipped : ''}`} 
              onClick={() => this.handleCardClick(index)} 
              disabled={players[activePlayerIndex].user_name !== mainPlayer.user_name ? "disabled" : ''}
            >  
              <div className={styles.inner}>
                <div className={styles.back}>
                  <img src={Cards_Back} alt="Card Back" />
                </div>
                <div className={styles.front}>
                  <img src={card.imageUrl} alt={card.name} />
                </div>
              </div>

              
            </button>
            
          ))}

        </div>
        <>
          {this.state.audioRefs.map((ref, index) => (
            <audio key={index} ref={ref} src={this.state.audios[index]} />
          ))}
        </>
      </div>
    );
  }
}

export default Tabs;
