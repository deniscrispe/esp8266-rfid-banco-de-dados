const logsTable = document.getElementById('logs-table');

const Logs = {
  all: () => {
    return http.get(endpoints.logs);
  },
  remove: (id) => {
    return http.delete(`${endpoints.logs}/${id}`);
  }
};

const updateTable = () => {
  Logs.all()
    .then((logs) => logs.data)
    .then((logs) => {
      let table = '';

      logs.forEach((log) => {
        table += `<tr>`;
        table += `<td>${log.id}</td>`;
        table += `<td>${log.usuario}</td>`;
        table += `<td>${log.tag}</td>`;
        table += `<td>${log.sala}</td>`;
        table += `<td>${log.data}</td>`;
        table += `<td>${log.hora}</td>`;
        //table += `<td class="has-text-centered remove" data-id="${log.id}"><span class="icon"><i class="fa fa-trash-o"></i></span></td>`;
        table += `</tr>`;
      });
      logsTable.innerHTML = table;
    })
    .catch((err) => console.log);
};

const remove = (id) => {
  Logs.remove(id)
    .then((log) => successMessage('Removido com sucesso'))
    .then((log) => updateTable())
    .catch((err) => dangerMessage(err));
};

$(document).ready(() => {
  updateTable();
  $(document).on('click', '.remove', function (e) {
    e.preventDefault();

    const id = $(this).data('id');
    remove(id);
    return false;
  });
});
