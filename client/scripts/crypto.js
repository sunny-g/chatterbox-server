

var Crypto = {
  padTextTo32: function(text) {
    text = String(text);
    var padding = '';
    if (text.length >= 32) {
      return [text.slice(0, 32), padding];
    } else {
      while (text.length < 32) {
        padding += 'a';
        text += 'a';
      }
      return [text, padding];
    }
  },

  decode: function(text) {
    var padded = Crypto.padTextTo32(text);
    return [nacl.util.decodeUTF8(padded[0]), padded[1]];
  },

  encode: function(tuple) {
    var arr = nacl.util.encodeUTF8(tuple[0]).split('');
    arr.splice(tuple[0].length - tuple[1].length, tuple[1].length);
    return arr.join('');
  },

  encrypt: function(username, message){
    var newEncryption = {};
    var newPair = nacl.box.keyPair.fromSecretKey(this.decode(username)[0]);
    newEncryption.username = username;
    newEncryption.publicKey = newPair.publicKey;
    newEncryption.nonce = nacl.randomBytes(24);
    var decodedM = this.decode(message);
    decodedM[0] = nacl.box(decodedM[0], newEncryption.nonce, newEncryption.publicKey, newPair.secretKey);

    newEncryption.encryptedM = decodedM;
    return JSON.stringify(newEncryption)
  },

  decrypt: function(payload){
    console.log('decrypting...', payload)
    var parsedPayload = JSON.parse(payload);
    var newPair = nacl.box.keyPair.fromSecretKey(this.decode(parsedPayload.username)[0]);
    parsedPayload.nonce = new Uint8Array(_(parsedPayload.nonce).toArray());
    parsedPayload.publicKey = new Uint8Array(_(parsedPayload.publicKey).toArray());
    parsedPayload.encryptedM[0] = new Uint8Array(_(parsedPayload.encryptedM[0]).toArray());
    parsedPayload.encryptedM[0] = nacl.box.open(parsedPayload.encryptedM[0],
      parsedPayload.nonce, parsedPayload.publicKey, newPair.secretKey);

    return this.encode(parsedPayload.encryptedM);
  }

};
