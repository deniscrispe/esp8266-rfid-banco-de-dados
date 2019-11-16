const db = require('./db');

const table = 'access_log';
const users = 'users';
const tags = 'tags';
const classroom = 'classroom';

const all = () => {
  return db.query(`SELECT l.id as id, u.name as usuario, t.tag as tag,  c.name as sala, DATE_FORMAT(l.created_at," %d/%m/%Y") as data, DATE_FORMAT(l.created_at, "%H:%i:%s") as hora   
          FROM  ${table} l INNER JOIN ${users} u  on l.id_user=u.id INNER JOIN ${tags} t on l.id_tag=t.id 
          INNER JOIN ${classroom} c on l.id_classroom=c.id`);
};

const find = (id) => {
  return db.find(table, id);
};

const create = (data) => {
  const query = `INSERT INTO ${table} (id_user, id_tag, id_classroom, status) VALUES (${data.id_user}, ${data.id_tag}, ${data.id_classroom}, ${data.status});`;

  return db.query(query);
};

const remove = (id) => {
  return db.remove(table, id);
};

const filtro = (data) => {

  let query = `SELECT l.id as id, u.name as usuario, t.tag as tag,  c.name as sala, DATE_FORMAT(l.created_at," %d/%m/%Y") as data, DATE_FORMAT(l.created_at, "%H:%i:%s") as hora   
  FROM  ${table} l INNER JOIN ${users} u  on l.id_user=u.id INNER JOIN ${tags} t on l.id_tag=t.id 
  INNER JOIN ${classroom} c on l.id_classroom=c.id WHERE 1=1 `;

  if(data.user){
    query += `and u.id = ${data.user} `;
  }

  if(data.classroom){
    query += `and c.id = ${data.classroom} `;
  }
  
  if(data.start && data.end){
    query += `and date(l.created_at) between '${data.start}'
    AND '${data.end}'`;
  }

  return db.query(query);
}

module.exports = {
  all: all,
  find: find,
  create: create,
  remove: remove,
  filtro: filtro
};
