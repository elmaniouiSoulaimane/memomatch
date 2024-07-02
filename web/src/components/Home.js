import React from "react";
import styles from "../modules/MemoryGame.module.css";
import StepWizard from "react-step-wizard";

//STEPS
import FirstStep from "./steps/FirstStep.js";
// import PlayersNumberStep from "./Steps/PlayersNumberStep.js";
import RoomDetailsStep from "./steps/RoomDetailsStep.js";
import UserDetailsStep from "./steps/UserDetailsStep.js";
import Room from "./Room.js";

class Home extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        currentStep: 1,
        ws: null,
        mainPlayer: null,
        players: [],
        news: [],
        roomName: '',
        isRoomAdmin: false
      };
    }

    // componentDidMount = () => {
    //     this.state.ws.onopen = () => {}
    //     this.state.ws.onclose = () => {}
    //     this.state.ws.onerror = (error) => {}
    // }

    //GAME EVENTS HANDLERS
    handlePlayerJoined = (message, players, mainPlayer, news) => {
        console.log("in handlePlayerJoined")
        const player = message.player

        const playerExists = players.some(existingPlayer => existingPlayer.user_name === player.user_name);

        if (!playerExists) {

            const isMainPlayer = mainPlayer.user_name === player.user_name

            const updatedPlayers = [...players, {
                    user_name: player.user_name,
                    avatar: player.avatar,
                    points: player.points,
                    cards: player.cards,
                    isMainPlayer: isMainPlayer ? true : false,
                    disabled: isMainPlayer ? false : true
                }
            ]

            
            this.setNews(message.update, player, news)
            this.setState({ players: updatedPlayers,  mainPlayer: player});
        }
    }

    handlePlayerCatchUp = (message, players, mainPlayer, news) => {
        console.log("in handlePlayerCatchUp")
        const all_messages = message.all_messages

        //console.log("all_messages", all_messages)
        console.log("mainPlayer", mainPlayer)
        console.log("this.state.mainPlayer", this.state.mainPlayer)

        all_messages.forEach(message => {
            const player = message.player
            console.log("player", player)
            const playerExists = players.some(existingPlayer => existingPlayer.user_name === player.user_name);
            
            if (player.user_name !== mainPlayer.user_name && !playerExists) {
                const updatedPlayers = [...players, {
                        user_name: player.user_name,
                        avatar: player.avatar,
                        points: player.points,
                        cards: player.cards,
                        isMainPlayer: false,
                        disabled: true,
                    }
                ]

                const update = "You caught up to player " + player.user_name + " who was already in the room."

                this.setNews(update, player, news)
                this.setState({ players: updatedPlayers });
            }
        });
    }

    handlePlayerMoved = (message, players, mainPlayer, news) => {
        const updatedPlayer = message.player

        if (updatedPlayer.user_name !== mainPlayer.user_name){
            
            const updatedPlayers = players.map(player => {
                if (player.user_name === updatedPlayer.user_name) {
                    return { ...player, ...updatedPlayer };
                }
                return player;
            });

            this.setState({
                players: updatedPlayers
            });
        }

        this.setNews(message.update, updatedPlayer, news)
    }

    handlePlayerQuit = (message, players, mainPlayer) => {
        const quitter =  message.player

        if (quitter.user_name !== mainPlayer.user_name){
            const updatedPlayers = players.filter(player => player.user_name !== quitter.user_name);
            this.setPlayers(updatedPlayers);
        }
    }

    //SET STATE
    handleStepChange = (step) => {
        this.setState({ currentStep: step });
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
        console.log("setMainPlayer")
        console.log("mainPlayer", mainPlayer)
        this.setState({
            mainPlayer: mainPlayer
        })
    }

    setNews = (update, updatedPlayer, news) => {
        const updates = [...news, {"update": update, "player": updatedPlayer}];
        this.setState({ news: updates });
    }

    setWebSocket = (new_ws) => {
        console.log("In setWebSocket")
        new_ws.onmessage = (event) => {

            //STATE
            const mainPlayer = this.state.mainPlayer
            const players = this.state.players
            const news = this.state.news

            //WEBSOCKET
            const jsonData = JSON.parse(event.data);
            const message = jsonData.message
            const gameEvent = message.event 


            if (gameEvent === 'player-joined'){
                console.log("player-joined")
                this.handlePlayerJoined(message, players, mainPlayer, news)
            }

            if (gameEvent === 'player-catch-up'){
                console.log("player-catch-up")
                this.handlePlayerCatchUp(message, players, mainPlayer, news)
            }
            
            if (gameEvent === 'player-moved'){
                this.handlePlayerMoved(message, players, mainPlayer, news)  
            }

            if (gameEvent === 'player-quit'){
                this.handlePlayerQuit(message, players, mainPlayer)
            }
        }

        this.setState({
            ws: new_ws
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
                <StepWizard className={styles.wizard} initialStep={this.state.currentStep}>
                    <FirstStep 
                        setStep={this.handleStepChange}
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
                        setMainPlayer={this.setMainPlayer}
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