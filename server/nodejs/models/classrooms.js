const db = require('./db');

const table = 'classroom';
const access = 'access_class';
const tags = 'tags';


const all = () => {
  return db.all(table);
};

const find = (id) => {
  return db.find(table, id);
};

const create = (data) => {
  const query = `INSERT INTO ${table} (name, matricula) VALUES ('${data.name}', '${data.matricula}');`;

  return db.query(query);
};

const update = (id, data) => {
  const query = `UPDATE ${table} SET name = '${data.name}', matricula = '${data.matricula}' WHERE id = ${id};`;

  return db.query(query);
};

const remove = (id) => {
  return db.remove(table, id);
};

const searchByTag = (id) => {
  return db.query(`SELECT a.id_classroom FROM ${access} a WHERE a.id_tag = ${id};`);//(SELECT t.id_user FROM ${tags} t WHERE t.id = ${id})`)
};

module.exports = {
  all: all,
  find: find,
  create: create,
  update: update,
  remove: remove,
  searchByTag: searchByTag
};
