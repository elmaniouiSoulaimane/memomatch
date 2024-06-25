// Room.js
import React from "react";
import Leaderboard from "./Leaderboard";
import NewsBroadcast from "./NewsBroadcast";
import Tabs from "./Tabs.js";
import styles from "../modules/Room.module.css";

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let roomName = this.props.roomName
        return (
            <>
                <span className={styles.roomTitle}>Room: {roomName}</span>
                <div className={styles.roomContainer}>
                    <div className={styles.newsBroadcast}>
                        <NewsBroadcast 
                            gameData={this.state.gameData} 
                            players={this.props.players} 
                            setPlayers={this.props.setPlayers}
                            news={this.props.news}
                        />
                    </div>
                    <div className={styles.cardsColumn}>
                        <Tabs 
                            ws={this.props.ws} 
                            mainPlayer={this.props.mainPlayer}
                            setMainPlayer={this.props.setMainPlayer}
                            players={this.props.players} 
                            setPlayers={this.props.setPlayers}
                        />
                    </div>
                    <div className={styles.leaderboard}>
                        <Leaderboard 
                            players={this.props.players}
                        />
                    </div>
                </div>
            </>
            
        );
    }
}

export default Room;
