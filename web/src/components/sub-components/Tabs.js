import React, { Component } from 'react';
import styles from "../../modules/Room.module.css"
import {Cards_Back, cardFlipSound, crowdBooingSound, crowdCheeringSound, success} from "../../imports"

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePlayerIndex: 0,
      flippedCards: [],
      audioRefs: [
        React.createRef(),
        React.createRef(),
        React.createRef(),
        React.createRef(),
      ],
      audios: [
        cardFlipSound,
        success,
        crowdBooingSound,
        crowdCheeringSound
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
    console.log("In handleCardClick")

    //PROPS
    const {setPlayers, players, ws, gameCompleted} = this.props

    if (gameCompleted) return

    //STATE
    // let {activePlayerIndex, flippedCards} = this.state
    
    let currentCard = players[this.state.activePlayerIndex].cards[index];

    let newFlippedCards = [...this.state.flippedCards, {"card": currentCard, "index":index}];

    //if player clicked on a non-flipped card and he has not yet reached two flipped cards
    if (!currentCard.flipped && this.state.flippedCards.length < 2) {
      this.playSound(0)
      
      const {updatedPlayers} = this.updatePlayerFlippedCard(players, this.state.activePlayerIndex, index, currentCard, newFlippedCards, setPlayers, ws)
      
      //Checking if player flipped the second card
      if (newFlippedCards.length === 2) {
        const [obj1, obj2] = newFlippedCards;
        
        if (obj1.card.name === obj2.card.name) {
          this.handleMatchingCards(updatedPlayers, this.state.activePlayerIndex, currentCard, setPlayers, ws)
          
        } else {
          this.handleNonMatchingCards(updatedPlayers, this.state.activePlayerIndex, currentCard, obj1, obj2, ws)
        }
      }
      
      //if player clicked on a non-flipped card and he has reached two flipped cards
    } else if (!currentCard.flipped && this.state.flippedCards.length === 2) {
      this.playSound(0)
      this.handleThirdCardClick(players, currentCard, index, setPlayers, ws)
    }

    if (this.allCardsFlipped(players)) {
      this.playSound(3)
      let ws_event = "player-won"
      let ws_update = "Player " + players[this.state.activePlayerIndex].user_name + " won"
      let ws_player = players[this.state.activePlayerIndex]
      this.sendWebSocketMessage(ws, ws_event, ws_update, ws_player)
    }
  };

  sendWebSocketMessage = (ws, event, update, player) => {
    console.log("In sendWebSocketMessage")
    ws.send(
      JSON.stringify(
        {
          "event": event, 
          "update": update,
          "player": player
        }
      )
    );
  };

  updatePlayerFlippedCard = (players, activePlayerIndex, cardIndex, currentCard, newFlippedCards, setPlayers, ws) => {
    console.log("In updatePlayerFlippedCard")
    let updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex].cards[cardIndex].flipped = true;

    let update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " card."

    console.log("//// newFlippedCards", newFlippedCards)

    this.setState((state) => {
      return { flippedCards: newFlippedCards };
    })
    setPlayers(updatedPlayers);

    this.sendWebSocketMessage(ws, "player-moved", update, updatedPlayers[activePlayerIndex]);

    return {updatedPlayers: updatedPlayers}
  };

  handleMatchingCards = (players, activePlayerIndex, currentCard, setPlayers, ws) => {
    console.log("In handleMatchingCards")
    setTimeout(() => {
      this.playSound(1)
    }, 800);
    
    let updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex].points += 20;
    let update = "Player " + players[activePlayerIndex].user_name + " flipped two " + currentCard.name + " cards!  +20Pts"
    
    setPlayers(updatedPlayers);

    this.sendWebSocketMessage(ws, "player-moved", update, updatedPlayers[activePlayerIndex]);

    setTimeout(() => {
      this.setState({ flippedCards: [] });
    }, 1500);
  };

  handleNonMatchingCards = (players, activePlayerIndex, currentCard, card1, card2, ws) => {
    console.log("In handleNonMatchingCards")

    setTimeout(() => {
      let updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex].cards[card1.index].flipped = false;
      updatedPlayers[activePlayerIndex].cards[card2.index].flipped = false;
      
      let update = "Player " + players[activePlayerIndex].user_name + " flipped " + currentCard.name + " a non-matching card, no points."
      this.sendWebSocketMessage(ws,  "player-moved", update, updatedPlayers[activePlayerIndex]);

      this.setState((state) => {
        return { flippedCards: [] };
      });
    }, 1500);
  };

  handleThirdCardClick = (players, currentCard, index, setPlayers, ws) => {
    console.log("In handleThirdCardClick")
    //FLIP THE FIRST TWO CARDS FAST AND INFORM EVERYONE
    const updatedPlayers = [...players];

    const [obj1, obj2] = this.state.flippedCards;
    updatedPlayers[this.state.activePlayerIndex].cards[obj1.index].flipped = false;
    updatedPlayers[this.state.activePlayerIndex].cards[obj2.index].flipped = false;
    updatedPlayers[this.state.activePlayerIndex].cards[index].flipped = true;
    let newFlippedCards = [{"card": currentCard, "index":index}];

    setPlayers(updatedPlayers);

    let update = "Player " + updatedPlayers[this.state.activePlayerIndex].user_name + " flipped " + currentCard.name + " card."

    this.sendWebSocketMessage(ws,  "player-moved", update, updatedPlayers[this.state.activePlayerIndex])

    setTimeout(() => {
      this.setState({ flippedCards: newFlippedCards });
    }, 500);
  };

  allCardsFlipped = (players) => {
    console.log("In allCardsFlipped")
    let current_player = players[this.state.activePlayerIndex];

    return current_player.cards.every((card) => card.flipped === true);
  }

  

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
