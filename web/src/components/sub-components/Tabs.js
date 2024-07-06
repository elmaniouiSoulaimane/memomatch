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

  playSound = (index) => {
    this.state.audioRefs[index].current.play();
  };

  handleCardClick = (index) => {
    console.log("You clicked on a card")
    this.playSound(0)

    //PROPS
    const {setPlayers, players, ws} = this.props

    //STATE
    const {activePlayerIndex, flippedCards} = this.state
    const currentCard = players[activePlayerIndex].cards[index];

    //if player clicked on a non-flipped card and he has not yet reached two flipped cards
    if (!currentCard.flipped && flippedCards.length < 2) {
      //UPDATE PLAYER FLIPPED CARD STATUS
      
      let updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex].cards[index].flipped = true;

      let update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " card."

      let newFlippedCards = [...flippedCards, {"card": currentCard, "index":index}];

      this.setState({ flippedCards: newFlippedCards });

      //updating the state of the home component
      setPlayers(updatedPlayers);

      ws.send(
        JSON.stringify(
          { 
            "event": "player-moved", 
            "update": update,
            "player": updatedPlayers[activePlayerIndex]
          }
        )
      );

      //Checking if player flipped the second card
      if (newFlippedCards.length === 2) {
        const [obj1, obj2] = newFlippedCards;
        
        // Matching cards
        if (obj1.card.name === obj2.card.name) {
          setTimeout(() => {
            this.playSound(1)
          }, 800);
          
          updatedPlayers[activePlayerIndex].points += 20;
          update = "Player " + players[activePlayerIndex].user_name + " flipped two " + currentCard.name + " cards!  +20Pts"

          //updating the state of the home component
          
          setPlayers(updatedPlayers);

          ws.send(
            JSON.stringify(
              { 
                "event": "player-moved", 
                "update": update,
                "player": updatedPlayers[activePlayerIndex]
              }
            )
          );

          setTimeout(() => {
            this.setState({ flippedCards: [] });
          }, 1500);
          
        } else { // Not matching cards
          setTimeout(() => {
            updatedPlayers[activePlayerIndex].cards[obj1.index].flipped = false;
            updatedPlayers[activePlayerIndex].cards[obj2.index].flipped = false;
            
            update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " a non-matching card, no points."
              
            ws.send(
              JSON.stringify(
                { 
                  "event": "player-moved", 
                  "update": update,
                  "player": updatedPlayers[activePlayerIndex]
                }
              )
            );
            this.setState({ flippedCards: [] });
          }, 1500);
        }
      }
      
      //if player clicked on a non-flipped card and he has reached two flipped cards
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

  render(){
    const {players, mainPlayer} = this.props
    const {activePlayerIndex, audioRefs, audios} = this.state

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
          {audioRefs.map((ref, index) => (
            <audio key={index} ref={ref} src={audios[index]} />
          ))}
        </>
      </div>
    );
  }
}

export default Tabs;
