const db = require('./db');
const des = require('../criptografia/descripto') 
const table = 'tags';
const acess = 'access_class';
const users = 'users';

const all = () => {
  return db.all(table);
};

const find = (id) => {
  return db.find(table, id);
};

const searchByTag = (tag) => {
  return db.query(`SELECT * FROM ${table} WHERE tag = '${tag}'`)
};

const authorizeTag = (data) => {
  var x = data.trim().split("-");

  if (x.length != 3){
    return db.query(`SELECT * FROM ${table} where 1=0`);
  }

  const req = {
    'class': Number(x[0]),
    'tag': x[1],
    'matricula': descript(x[2])
  };

  return db.query(`SELECT t.id as id_tag, u.id as id_user, ${req.class} as id_classroom, t.state FROM ${table} t INNER JOIN ${users} u on t.id_user = u.id
            WHERE t.tag = '${req.tag}' and u.matricula ='${req.matricula}' 
                and ${req.class} in (SELECT a.id_classroom FROM ${acess} a 
                            WHERE a.id_tag=t.id)`)
};

const descript = (mat) => {
  return des.make(mat.trim());
};

const create = (data) => {
  const query = `INSERT INTO ${table} (id_user, tag, state) VALUES (${data.user}, '${data.tag}', ${data.state});`;
  db.query(query);
  //db.query(`DELETE FROM ${acess} WHERE id_user = ${data.tag};`);
  
  let queryAux = data.salas
    .map((item) => {
      return `((SELECT AUTO_INCREMENT - 1 as CurrentId FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'rfid' AND TABLE_NAME = '${table}'),`+item +`)`
    })
    .join([separador = ','])
  
  return db.query(`INSERT IGNORE INTO ${acess} (id_tag,id_classroom) VALUES ${queryAux} ;`);
};

const update = (id, data) => {
  const query = `UPDATE ${table} SET tag = '${data.tag}', state = ${data.state}, id_user = ${data.user} WHERE id = ${id};`
  
  db.query(`DELETE FROM ${acess} WHERE id_tag = ${id};`);
  
  let queryAux = data.salas
    .map((item) => {
      return `(${id},`+item +`)`
    })
    .join([separador = ','])
    
  db.query(`INSERT IGNORE INTO ${acess} (id_tag,id_classroom) VALUES ${queryAux} ;`);
    
  return db.query(query);
};

const remove = (id) => {
  db.query(`DELETE FROM ${acess} WHERE id_tag = ${id};`);
  return db.remove(table, id);
};

module.exports = {
  all: all,
  find: find,
  searchByTag: searchByTag,
  authorizeTag: authorizeTag,
  create: create,
  update: update,
  remove: remove
};
