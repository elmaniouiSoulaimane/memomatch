import React, { Component, createRef } from 'react';
import styles from "../modules/MemoryGame.module.css";
import StepWizard from "react-step-wizard";

//STEPS
import FirstStep from "./steps/FirstStep.js";
// import PlayersNumberStep from "./Steps/PlayersNumberStep.js";
import RoomDetailsStep from "./steps/RoomDetailsStep.js";
import UserDetailsStep from "./steps/UserDetailsStep.js";
import Room from "./Room.js";

class Home extends Component {
    constructor(props) {
      super(props);
      this.state = {
        stepWizardRef: createRef(),
        ws: null,
        mainPlayer: null,
        players: [],
        news: [],
        roomName: '',
        isRoomAdmin: false
      };
    }

    //GAME EVENTS HANDLERS
    setWebSocket = (new_ws) => {
        new_ws.onmessage = (data) => {

            //WEBSOCKET
            const jsonData = JSON.parse(data.data);
            const {message} = jsonData
            const {event} = message

            if (event === 'player-joined'){
                this.handlePlayerJoined(message)
            }

            if (event === 'player-catch-up'){
                this.handlePlayerCatchUp(message)
            }
            
            if (event === 'player-moved'){
                this.handlePlayerMoved(message)  
            }

            if (event === 'player-quit'){
                this.handlePlayerQuit(message)
            }
        }

        this.setState({
            ws: new_ws
        })
    }

    handlePlayerJoined = (message) => {
        console.log("in handlePlayerJoined")
        
        const { players, mainPlayer } = this.state;
        const {player, update} = message
        const { user_name, avatar, points, cards } = player;

        const playerExists = players.some(existingPlayer => existingPlayer.user_name === player.user_name);

        if (!playerExists) {

            const isMainPlayer = mainPlayer.user_name === player.user_name

            this.setState(prevState => {
                const updatedPlayers = [...prevState.players, {
                    user_name: user_name,
                    avatar: avatar,
                    points: points,
                    cards: cards,
                    isMainPlayer: isMainPlayer ? true : false,
                    disabled: isMainPlayer ? false : true
                }];
                
                return {
                    // mainPlayer: isMainPlayer ? player : prevState.mainPlayer,
                    players: updatedPlayers,
                    news: [...prevState.news, {"update": update, "player": player}]
                };
            });
        } 
        if (player.user_name === mainPlayer.user_name) {
            this.state.stepWizardRef.current.goToStep(4);
        }
    }

    handlePlayerCatchUp = (message) => {
        console.log("in handlePlayerCatchUp")

        const { all_messages } = message;

        all_messages.forEach(({ player, update }) => {
            const { mainPlayer, players } = this.state;
            let { user_name, avatar, points, cards } = player;

            let playerExists = players.some(existingPlayer => existingPlayer.user_name === user_name);
            // console.log("playerExists", playerExists)
            
            // if (user_name !== mainPlayer.user_name && !playerExists) {
            if (user_name !== mainPlayer.user_name) {
                if (!playerExists) {
                    this.setState(prevState => {
                        const updatedPlayers = [...prevState.players, {
                            user_name: user_name,
                            avatar: avatar,
                            points: points,
                            cards: cards,
                            isMainPlayer: false,
                            disabled: true,
                        }];
                        
                        let newUpdate = "You caught up to player " + user_name + "."
            
                        return {
                            players: updatedPlayers,
                            news: [...prevState.news, {"update": newUpdate, "player": player}]
                        };
                    });
                }else {
                    this.setState(prevState => {
                        const updatedPlayers = [...prevState.players];
                        for (let i = 0; i < prevState.players.length; i++) {
                            if (prevState.players[i].user_name === user_name) {
                                updatedPlayers[i] = player
                            }
                        }
            
                        return {
                            players: updatedPlayers,
                            news: [...prevState.news, {"update": update, "player": player}]
                        };
                    });
                }
            }
        });
    }

    handlePlayerMoved = (message) => {
        const { player, update } = message

        this.setState(prevState => {
            const { players, mainPlayer, news } = prevState;
            if (player.user_name !== mainPlayer.user_name){

                //updates the action of the player that is in the players state variable
                const updatedPlayers = players.map(item => (item.user_name === player.user_name ? { ...item, ...player } : item));

                return {
                    players: updatedPlayers,
                    news: [ ...news, { "update": update, "player": player }]
                }
            }else{
                return {
                    news: [ ...news, { "update": update, "player": player }]
                }
            }
        });
    }

    handlePlayerQuit = (message) => {
        const { players, mainPlayer } = this.state;
        const { player } =  message

        if (player.user_name !== mainPlayer.user_name){
            const updatedPlayers = players.filter(item => item.user_name !== player.user_name);
            this.setState({
                players: updatedPlayers
            });
        }
    }

    setPlayers = (players) => {
        this.setState({
            players: players
        });
    }

    setRoomName = (name) => {
        this.setState({
            roomName: name
        })
    }

    setMainPlayer = (mainPlayer) => {
        this.setState({
            mainPlayer: mainPlayer
        })
    }

    setIsRoomAdmin = (result) => {
        this.setState({
            isRoomAdmin: result
        })
    }

    render() {
        return (
            <div className={styles.mainContainer}>
                <h1 className={styles.h1}>Memory Game</h1>
                <StepWizard className={styles.wizard} initialStep={this.state.currentStep} ref={this.state.stepWizardRef}>
                    <FirstStep
                        setIsRoomAdmin={this.setIsRoomAdmin}
                    />
                    <RoomDetailsStep 
                        setWebSocket={this.setWebSocket}
                        isRoomAdmin={this.state.isRoomAdmin}
                        setRoomName={this.setRoomName}
                    />
                    <UserDetailsStep 
                        ws={this.state.ws}
                        setMainPlayer={this.setMainPlayer}
                        isRoomAdmin={this.state.isRoomAdmin}
                    />
                    <Room
                        ws={this.state.ws}
                        mainPlayer={this.state.mainPlayer}
                        players={this.state.players} 
                        setPlayers={this.setPlayers} 
                        news={this.state.news}
                        roomName={this.state.roomName}
                    />
                </StepWizard>
            </div>
        );
    }
}

export default Home