// Leaderboard.js
import React from "react";
import styles from "../modules/Room.module.css";


class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: []
        };
    }

    render() { 
        const players = this.props.players
        const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);
    
        return (
            <div className={styles.leaderBoard}>
                <span className={styles.lbtitle}>Leaderboard</span>

                {sortedPlayers.map((player, index) => (
                    <div key={index} className={styles.player}>
                        <div key={index} className={styles.playerCard}>
                            <img src={player.avatar} alt={player.user_name}/>
                            <div className={styles.playerInfo}>
                                <span>{player.user_name}</span>
                                <span>{player.points} Pts</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
};

export default Leaderboard;
