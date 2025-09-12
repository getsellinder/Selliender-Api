
import React from 'react';
import { Paper } from '@material-ui/core';

const MessageList = ({ messages }) => {
  return (
    <>
      {messages.map((msg, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <Paper
            elevation={3}
            style={{
              padding: '10px',
              backgroundColor: msg.user === 'user' ? 'white' : 'lightgray',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {msg.user === 'user' ? 'User' : 'Admin'}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {msg.replyDate}
            </div>
            <div>{msg.message}</div>
          </Paper>
        </div>
      ))}
    </>
  );
};

export default MessageList;

