const db = require('./db');

const table = 'users';

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

module.exports = {
  all: all,
  find: find,
  create: create,
  update: update,
  remove: remove
};
