
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const languageMap = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '3' },
  java: { language: 'java', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '0' },
};

const getLanguageExtension = (lang) => {
  switch (lang) {
    case 'javascript':
      return javascript();
    case 'python':
      return python();
    case 'java':
      return java();
    case 'cpp':
      return cpp();
    default:
      return javascript();
  }
};

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [output, setOutput] = useState('');
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('No code to run!');
      return;
    }

    const { language: jdLang, versionIndex } = languageMap[language];
    setOutput('Running code...');

    try {
      const { data } = await axios.post('http://localhost:5000/run', {
        script: code,
        stdin: userInput,
        language: jdLang,
        versionIndex,
      });

      const resultOutput = data.output?.trim() || 'No output returned';
      setOutput(
        `Code executed!\nLanguage: ${jdLang}\nInput:\n${userInput}\nOutput:\n${resultOutput}`
      );
    } catch (error) {
      console.error('JDoodle API error:', error?.response?.data || error.message);
      toast.error('Code execution failed');
      setOutput(
        error?.response?.data?.error || 'An error occurred while executing your code.'
      );
    }
  };
  const [userId] = useState(() => {
  const savedId = localStorage.getItem('userId');
  if (savedId) return savedId;
  const newId = uuidv4();
  localStorage.setItem('userId', newId);
  return newId;
});

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', handleErrors);
      socketRef.current.on('connect_failed', handleErrors);

      function handleErrors(e) {
        console.error('Socket error:', e);
        toast.error('Socket connection failed');
        navigate('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
        userId,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }

        console.log('JOINED event received:', clients);

 setClients(() => {
  const filtered = clients.filter(c => c.userId); // skip incomplete entries
  const uniqueByUserId = Array.from(
    new Map(filtered.map((c) => [c.userId, c])).values()
  );
  return uniqueByUserId;
});



        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [roomId, location.state?.username]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleCodeChange = ({ code: incomingCode }) => {
      if (incomingCode !== null && incomingCode !== code) {
        setCode(incomingCode);
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [code]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy Room ID');
    }
  };

  const leaveRoom = () => {
    navigate('/');
  };

  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="mainwrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" width="200px" src="/code.png" alt="Logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leavebtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorwrap" style={{ width: '100%' }}>
        <div style={{ padding: '0.5rem', textAlign: 'right' }}>
          <select
            className="language-selector"
            value={language}
            onChange={handleLanguageChange}
            style={{ padding: '0.3rem', fontSize: '1rem' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <CodeMirror
          value={code}
          height="60vh"
          theme="dark"
          extensions={[getLanguageExtension(language)]}
          onChange={(value) => {
            setCode(value);
            socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            autocompletion: true,
          }}
          style={{
            fontSize: '14px',
            fontFamily: 'monospace',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          }}
        />

        <textarea
          placeholder="Enter custom input here (stdin)..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            width: '100%',
            height: '100px',
            marginTop: '1rem',
            padding: '0.75rem',
            fontFamily: 'monospace',
            fontSize: '1rem',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            border: '1px solid #555',
            borderRadius: '4px',
            resize: 'none',
          }}
        />

        <div style={{ marginTop: '1rem' }}>
          <button className="run-btn" onClick={runCode}>
            Execute
          </button>
          <textarea
            className="output-console"
            value={output}
            readOnly
            placeholder="Output will appear here ..."
            style={{
              width: '100%',
              height: '150px',
              marginTop: '0.5rem',
              padding: '0.75rem',
              fontFamily: 'monospace',
              fontSize: '1rem',
              backgroundColor: '#1e1e1e',
              color: '#00ff00',
              border: '1px solid #333',
              borderRadius: '4px',
              resize: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;


