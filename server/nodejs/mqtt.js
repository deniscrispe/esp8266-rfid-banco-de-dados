const mqtt = require('mqtt')
  , request = require('request-promise')
  , config = require('./config/config');

const client = mqtt.connect("mqtt://broker.hivemq.com");
const rfidPingTopic = '/smartaccess/denis/catraca/entrada/ping';
const rfidPongTopic = '/smartaccess/denis/catraca/entrada/pong';

client.on('message', (topic, message) => {
  if (rfidPingTopic !== topic) return;  
  const tag = message.toString();
  console.log(tag);
  authorizeRfid(topic, tag);
});

client.on('connect', () => {
  console.log(`Connection successfully to ${config.broker.host}`);
  client.subscribe(rfidPingTopic,{qos:1});
});

//handle errors
client.on('error',(error) => {
  console.log("Can't connect" + error);
  process.exit(1)
});

const authorizeRfid = (topic, tag) => {
  console.log("AA");
  console.log(tag);
  request(`${config.api.endpoints.tags}authorize/${tag}`)
    .then((data) => JSON.parse(data))
    .then((result) => formatPayload(result))
    .then((payload) => createLog(payload))
    .then((status) => sendPong(status))
    .catch((err) => console.log(err));

};
const formatPayload = (result) => {
  const payload = {
    'data': result,
    'status': 0,
  };
  if (!result.id_tag || result.state === 0) {
    return payload;
  }
  payload.status = 1;
  return payload;
};

const createLog = (payload) => {
  if (!payload.data.id_tag) return payload.status;

  console.log(payload);

  const log = {
    id_user: payload.data.id_user,
    id_tag: payload.data.id_tag,
    id_classroom: payload.data.id_classroom,
    status: payload.status
  };

  const options = {
    method: 'POST',
    uri: config.api.endpoints.log,
    body: log,
    json: true
  };

  request(options)
    .then((res) => console.log(res))
    .catch((err) => console.log('err'));

  return payload.status;
};

const sendPong = (state) => {
  console.log(`Acesso ${state ? 'permitido' : 'bloqueado'}!`);
  client.publish(rfidPongTopic, state.toString());
};
