const logsTable = document.getElementById('logs-table');
const usuarioSelect = $('#usuarios');
const salasSelect = $('#salas');
const dataFiltro = $('#daterange');


const Classes = {
  all: () => {
    return http.get(endpoints.classrooms);
  },
  getPermitidas:(id) =>{
    return http.get(`${endpoints.classrooms}/tag/${id}`);
  }
};

const Logs = {
  all: () => {
    return http.get(endpoints.logs);
  },
  remove: (id) => {
    return http.delete(`${endpoints.logs}/${id}`);
  },
  filtro: (filtro) => {
    return http.get(`${endpoints.logs}/filtro/${filtro}`);
  }
};

const Users = {
  all: () => {
    return http.get(endpoints.users);
  },
  get: (id) => {
    return http.get(`${endpoints.users}/${id}`);
  },
  create: (data) => {
    return http.post(endpoints.users, data);
  },
  update: (id, data) => {
    return http.put(`${endpoints.users}/${id}`, data);
  },
  remove: (id) => {
    return http.delete(`${endpoints.users}/${id}`);
  }
};


const updateUsers = () => {
  Users.all()
    .then((users) => users.data)
    .then((users) => {
      var lista = document.getElementById("usuarios");

      users.forEach((user) => {
        // cria a opção com a nova opção a ser inserida na lista de seleção
        var opcao = document.createElement("option");
        
        opcao.text = user.name
        
        opcao.value = user.id;
        
        lista.add(opcao);
      });
    })
    .catch((err) => console.log);
};

const updateClasses = (permitidas) => {
  Classes.all()
      .then((classrooms) => classrooms.data)
      .then(classrooms => {
        var lista = document.getElementById("salas");

        classrooms.forEach((classroom) => {
          // cria a opção com a nova opção a ser inserida na lista de seleção
          var opcao = document.createElement("option");
        
          opcao.text = classroom.name
        
          opcao.value = classroom.id;
        
          lista.add(opcao);
        });
      })       
      .catch((err) => console.log(err));
}

const limparFiltro = () => {
  usuarioSelect.val(null);
  salasSelect.val(null);
  dataFiltro.val("01/01/2019 - "+new Date().toLocaleDateString("pt-BR"));

}

function formataData(data){
  let formatada=[];

  if(data){

    data = data.split("-");

    let start = data[0];
    start = start.split("/");

    let end = data[1];
    end = end.split("/");

    formatada.push(start[2].trim()
                    +"-"
                    +start[1].trim()
                      +"-"
                        +start[0].trim());

    formatada.push(end[2].trim()
                    +"-"
                    +end[1].trim()
                      +"-"
                        +end[0].trim());
  }                                           

  return formatada;
}

const filtroTable = () => {

  let filtro = '';

  if(usuarioSelect.val()){
    filtro += usuarioSelect.val();
  }

  filtro += '@'

  if(salasSelect.val()){
    filtro += salasSelect.val();
  }

  filtro += '@'

  if(dataFiltro.val()){
    let aux = formataData(dataFiltro.val());
    filtro += aux[0];
    filtro += '@'
    filtro += aux[1];
  }

  Logs.filtro(filtro)
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
  updateUsers();
  updateClasses();
  updateTable();
  $('.filtrarLog').on('click', function (e) {
    filtroTable();
    
    return false;
  });

  $('.limparFiltro').on('click', function (e) {
    limparFiltro();
    
    return false;
  });

  $(document).on('click', '.remove', function (e) {
    e.preventDefault();

    const id = $(this).data('id');
    remove(id);
    return false;
  });
});
