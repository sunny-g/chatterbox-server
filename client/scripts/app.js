Backbone.pubSub = _.extend({}, Backbone.Events);
var keypairs = {};

var username = window.location.search.split('=')[1];
var room = '';
var APIURL = 'https://api.parse.com/1/classes/chatterbox';

var Message = Backbone.Model.extend({
  url: function() { return APIURL},

  idAttribute: "objectId",

  initialize: function() {
    // encrypt message here

    // TODO: ENABLE THIS TO RE-ENABLE MESSAGE ENCRYPTION
    // var ciphertext = Crypto.encrypt(this.get('username'), this.get('text'));
    ciphertext = this.get('text');
    this.set('text', ciphertext);
    this.set('date', new Date(this.get('updatedAt')));
  }
});

var MessageView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },

  render: function() {
    var messageTemplate = $('#basicTemplate').html();
    Mustache.parse(messageTemplate);

    var attr = this.model.toJSON();
    try{
      // console.log(JSON.parse(attr.text))
      // if(JSON.parse(attr.text).nonce){
        // attr.text = Crypto.decrypt(attr.text);
      // }
    }catch(e){
    }
    // console.log(attr)
    var rendered = Mustache.render(messageTemplate, attr);
    this.$el.html(rendered);
    return this;
  },

  decrypt: function() {
    try {
      this.model.set('text', Crypto.decrypt(this.model.get('text')));
      this.render();
    } catch(e) {
      console.log('failed to decrypt message', e)
    }
  },

  events: {
    "click .decrypt": "decrypt"
  }
});

/**********************************************************/

var MessagesCollection = Backbone.Collection.extend({
  model: Message,

  initialize: function(){
    this.filter = {};
  },

  changeFilter: function(e){
    if(e[1].length === 0){
      delete this.filter[e[0]];
    } else {
      this.filter[e[0]] = e[1];
    }
    // this.updateMessages();
  },

  url: function() { return APIURL },

  parse: function(res){
    return res.results;
  },

  updateMessages: function() {
    this.fetch({
      data: {
        limit: 25,
        order: '-updatedAt',
        where: this.filter
      }
    });
  }
});

var MessagesView = Backbone.View.extend({
  initialize: function(obj) {
    this.render();
    this.time = obj.time;
    setInterval(this.collection.updateMessages.bind(this.collection), this.time)
    this.collection.on('sync', this.render, this);
  },

  render: function() {
    this.$el.html('');
    this.collection.each(function(msg){
      var element = new MessageView({model:msg}).el;
      this.$el.append(element)
    }, this);
    return this;
  },

  filterUser: function(e){
    this.collection.changeFilter(['username', e.toElement.textContent]);
    this.collection.updateMessages();
  }
});

var ControlsModel = Backbone.Model.extend({
  initialize: function(obj){
    this.set('msgInput', obj.msgInput);
    this.set('roomInput', obj.roomInput);
    this.set('changeRoomInput', obj.changeRoomInput);
  }
});

var ControlsView = Backbone.View.extend({
  submit: function(){
    var msg = this.model.get('msgInput');
    var room = this.model.get('roomInput')
    this.collection.create({
      username: username,
      text: msg,
      roomname: room
    })
  },

  updateInput: function(){
    this.model.set('msgInput', $('.msgInput').val())
    this.model.set('roomInput', $('.roomInput').val())
    this.model.set('changeRoomInput', $('.changeRoom').val())
  },

  changeRoom: function(){
    this.collection.changeFilter(['roomname',this.model.get("changeRoomInput")]);
    this.collection.updateMessages();
  },

  goHome: function(){
    this.collection.changeFilter(['roomname','']);
    this.collection.changeFilter(['username','']);
    this.collection.updateMessages();
  }
});


