$(document).ready(function () {
  /*global io*/
  let socket = io();

  socket.on('user', (data) => {
    $('#num-users').text(data.currentUsers + ' users online');
    let message = data.name + (data.connected ? ' has joined the chat.' : ' has left the chat.');
    $('#messages').append($('<li>').html('<b>' + message + '</b>'));
  });

  socket.on('chat message', (data) => {
    $('#messages').append($('<li>').html(data.name + ": " + data.message));
  });
  
  $('form').submit(function () {
    var messageToSend = $('#m').val();
    if (messageToSend !== '') {
      socket.emit('chat message', messageToSend);
      $('#m').val('');
    }
    return false; // prevent form submit from refreshing page
  });
});
