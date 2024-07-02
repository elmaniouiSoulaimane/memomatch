// Room.js
import React from "react";
import Leaderboard from "./sub-components/Leaderboard.js";
import NewsBroadcast from "./sub-components/NewsBroadcast.js";
import Tabs from "./sub-components/Tabs.js";
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
