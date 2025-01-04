import React, { useEffect, useState,useRef } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS, { DISCONNECTED, JOINED } from '../Actions';
import { useLocation,useParams,useNavigate,Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const EditorPage = () => {
  const [clients,setClients]=useState([]);
  const { roomId } = useParams();
  const socketRef=useRef(null);
  const location=useLocation();
  const reactNavigator=useNavigate();
  const codeRef=useRef(null);

  useEffect(()=>{
    const init=async()=>{
      socketRef.current=await initSocket();
      socketRef.current.on('connect_error',(err)=>handleErrors(err));
      socketRef.current.on('connect_failed',(err)=>handleErrors(err));

      function handleErrors(e){
        console.log('socket error',e);
        toast.error('Socket connection failed,try again later');
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN,{
        roomId,
        username:location.state?.username,
      });

      //listening  for joined event
      socketRef.current.on(ACTIONS.JOINED,({clients,username,socketId})=>{
        if(username!==location.state?.username){
               toast.success(`${username} joined the room`);
               console.log(`${username} joined`);
        }

        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE,{
          code: codeRef.current,
          socketId
        })
      })
      //listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username})=>{
          toast.success(`${username} left the room.`);
          setClients((prev)=>{
            return prev.filter((clients) => clients.socketId!==socketId);
          })
      })
    };
    init();
     return()=>{
      if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.off(JOINED);
      socketRef.current.off(DISCONNECTED);
     }    
    }
  },[roomId, location.state?.username])

   async function copyRoomId(){
    try{
         await navigator.clipboard.writeText(roomId);
         toast.success('Room ID has been copied to your clipboard');
    }catch(err){
          toast.error('could not copy the Room ID');
          console.error(err);
    }
  }
  function leaveRoom(){
    reactNavigator('/');
  }
  if(!location.state){
    return <Navigate to ="/"/>;
    }
  
  return (
    <div className='mainwrap'>
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
          <img className='logoImage' width="200px"src="/code.png"/>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
               {
                clients.map((client)=>(
                  <Client key={client.socketId} username={client.username} />
                ))
               }
          </div>
        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
        <button className='btn leavebtn' onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorwrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{codeRef.current=code}}/>
      </div>
    </div>
  )
}

export default EditorPage
