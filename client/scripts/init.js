$(function(){
  var messages = new MessagesCollection();

  var messagesView = new MessagesView({
    el:'#main2',
    time: 5000,
    collection: messages,
    events: {
      "click .username" : "filterUser"
    }
  });

  var controlsModel = new ControlsModel({
      msgInput: '',
      roomInput: '',
      changeRoomInput: ''
  });

  var controlsView = new ControlsView({
    el: '#controls',
    model: controlsModel,
    collection: messages,
    events: {
      "keyup .msgInput" : "updateInput",
      "keyup .roomInput" : "updateInput",
      "keyup .changeRoom" : "updateInput",
      "click #submitMessage" : "submit",
      "click #changeRoom" : "changeRoom",
      "click #goHome" : "goHome"
    }
  });

  messages.updateMessages();

});
