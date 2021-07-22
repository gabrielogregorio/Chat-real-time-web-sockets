const express = require('express');
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Para a versão 2 fazer somente uma base comum
var usuarios = [];
var socketIds = [];
var imagePerfil = {};


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})


io.on('connection', (socket) => {
  socket.on('new user', (data) => {
    if (usuarios.indexOf(data) != -1) { // Usuário já está usando
      socket.emit('new user', {'success': false})
    } else { // Usuário não existe no array

      // Itens de imagem
      var listaItens = ['/icons/1.webp', '/icons/2.png', '/icons/3.png', '/icons/4.webp', '/icons/5.png', '/icons/6.png', '/icons/7.png', '/icons/8.webp', '/icons/9.png'];

      // Sorteia um item
      var choice = parseInt(((listaItens.length - 1) * Math.random() * 10) / (listaItens.length - 1));
      if (listaItens.length == choice) { choice = listaItens.length - 1; }
      imagePerfil[socket.id] = listaItens[choice];

      // Adiciona o usuário na lista de permissões
      usuarios.push(data);
      socketIds.push(socket.id)
      socket.emit('new user', {'success': true})
    }
  })
  
  socket.on('chat message', (obj) => {
    // Ver se usuário está registrado e se o socket id dele é igual a indexof no
    // em usuários
    if (
        usuarios.indexOf(obj.name) != -1 &&
        usuarios.indexOf(obj.name) == socketIds.indexOf(socket.id)
      ) {

        obj.img = imagePerfil[socket.id];
        io.emit('chat message', obj);
    } else {
      // usuário manipulou o nome dele
      console.log('Espertalhão Detectado!')
    }

    socket.on('disconnect', () => {
      let id = socketIds.indexOf(socket.io);
      socketIds.splice(id, 1);
      usuarios.splice(id, 1);
    })
  })
})

http.listen(8080, () => {
  console.log('Listen in on 8080')
})
