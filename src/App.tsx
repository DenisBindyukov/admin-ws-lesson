import React, {useEffect, useState} from 'react';
import './App.css';
import io, {Socket} from "socket.io-client";
import axios from "axios";

const socketIoApi = {
    socket: null as null | Socket,

    createConnection() {
        const options = {
            extraHeaders: {
                token: '123',
                roomKey: 'test_room'
            }
        }

        this.socket = io('http://localhost:5001/admin', options);

        this.socket.on("connect", () => {
            console.log("ws:connect")
        })

        this.socket.on("disconnect", () => {
            console.log("ws:disconnect")
        })
    },
}


function App() {
    const [text, setText] = useState('');
    const [eventPath, setEventPath] = useState<any>("");
    const [error, setError] = useState('');
    const [quizStatus, setQuizStatus] = useState(true);

    const connectSocket = () => {
        socketIoApi.createConnection()
        socketIoApi.socket?.on('admin-path', (data: any
        ) => {
            console.log('admin-path', data)
            setEventPath(JSON.stringify(data))
        })
        //

        socketIoApi.socket?.on('error', (data: any
        ) => {
            console.log('error', data)
            setError(JSON.stringify(data))
        })

        socketIoApi.socket?.on('401', (data: any
        ) => {
            console.log('error', data)
            setError(JSON.stringify(data))
        })

        socketIoApi.socket?.onAny((event) => {
            if (event.message?.length) {
                setError(JSON.stringify(event))
            }
        })


        // socketIoApi.socket?.onAny((ev) => {
        //     // console.log('onAny')
        //     // console.log('ev: ', ev)
        //     console.log('ev', ev)
        //     if (ev.type === 'Error') {
        //         setError(JSON.stringify(ev.message))
        //     }
        //
        //     setEventPath(JSON.stringify(ev))
        // })
    }

    const onClickHandler = () => {
        socketIoApi.socket?.emit('admin-path', {value: text, id: '1'})
    }

    const validateParticipants = async () => {
        await axios.post('http://localhost:5001/validate-participants', {participantId: '1', status: 'approved'})
    }

    const sendQuizStatus = async () => {
        await axios.post('http://localhost:5001/quiz-management', {
            quizId: 'test_room',
            status: quizStatus
        })
        setQuizStatus(state => !state)
    }

    useEffect(() => {
        connectSocket()
    }, [])

    return (
        <div className="App">
            <header className="App-header">
                <h1>Client-Admin</h1>
                <div>
                    <input type="text"
                           value={text}
                           onChange={(e) => {
                               setText(e.currentTarget.value)
                           }}/>
                    <button onClick={onClickHandler}>Send</button>
                </div>
                <div>
                    <h3>message from back-end</h3>
                    {eventPath}
                </div>
                {/*<div>Event by path: {eventPath}</div>*/}
                <div style={{color: 'red'}}>Error: {error}</div>

                <div>
                    <h2>Validate Participants</h2>
                    <button onClick={validateParticipants}>
                        start
                    </button>
                </div>

                <div>
                    <h3>Quiz Management</h3>
                    <div>
                        <button style={{marginRight: '20px'}} onClick={sendQuizStatus}>
                            {!quizStatus ? 'Close Quiz' : 'Start Quiz'}
                        </button>
                    </div>
                </div>


            </header>
        </div>
    );

}

export default App;
