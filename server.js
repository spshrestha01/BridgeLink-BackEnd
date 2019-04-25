const express = require('express');
const mongoose = require('mongoose');
const cookierParser = require('cookie-parser');
//const logger = require('morgan');
const cors = require('cors');
const _ = require('lodash');

const app = express();
const dbConfig = require('./config/secret');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoutes');
const message = require('./routes/messageRoutes');
const image = require('./routes/imageRoutes');
const { User } = require('./Helpers/UserClass');
require('./socket/stream')(io, User, _);
require('./socket/private')(io);
app.use(cors());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookierParser());
//app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, { useNewUrlParser: true });

app.use('/api/bridgelink', auth);
app.use('/api/bridgelink', posts);
app.use('/api/bridgelink', users);
app.use('/api/bridgelink', friends);
app.use('/api/bridgelink', message);
app.use('/api/bridgeLink', image);

server.listen(3000, () => {
  console.log('Running on port 3000 !');
});
