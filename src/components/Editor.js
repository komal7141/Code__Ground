import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({socketRef,roomId,onCodeChange}) => {
  const editorRef=useRef(null);
    useEffect(()=>{
      async function init() {
      

       editorRef.current=  Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
          mode:{name:'javascript',json:true},
          theme:'darcula',
          autoCloseTags:true,
          autoCloseBrackets:true,
          lineNumbers:true,
        });
        editorRef.current.on('change',(instance,changes)=>{
           console.log('change',changes);
           const {origin}=changes;
           const code=instance.getValue();
           onCodeChange(code);
           if(origin!=='setValue'){
            if (socketRef.current) {
              console.log('working',code);
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
            }
          
           }
           console.log(code);
        });
       
      }
      init();
    }, [socketRef, roomId]);

    useEffect(()=>{
      if (socketRef.current) {
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
       //   console.log('receiving ',code);
          if (code !== null && editorRef.current) {
            editorRef.current.setValue(code);
          }
        });
      }
     
      return ()=>{
        if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE)
        }
      }
    },[socketRef.current])
  
  return (

  <textarea id="realtimeEditor">

  </textarea>
  )
}

export default Editor;
