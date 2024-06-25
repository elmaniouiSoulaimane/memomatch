import React from "react";
import styles from "../modules/Room.module.css";

class NewsBroadcast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: []
        };
    }
    render() {      
        return (
            <>
                <span className={styles.tabTitle}>News Broadcast</span>
                <div className={styles.updates}>
                { this.props.news.slice().reverse().map((news, index) =>(
                    <div key={index} className={styles.update}>
                        <img src={news.player.avatar} alt={news.player.user_name}/>
                        <span>{news.update}</span>
                    </div>
                ))}
                </div>
            </>
        )
    };
};

export default NewsBroadcast;
