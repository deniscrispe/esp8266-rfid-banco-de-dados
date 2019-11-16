const tagsTable = document.getElementById('tags-table');
const tagInput = $('#tag');
const usuarioSelect = $('#usuarios');
const stateChebox = $('#state');
const idInput = $('#id');

let salas3=[];

////////////////////////////////////////////////////////////////////////

const mqttConnect = () => {
  return new Paho.MQTT.Client(
    mqttConfig.broker,
    parseInt(mqttConfig.port),
    "DZ-" + Date.now()
  );
};

const onConnectionLost = (responseObject) => {
  const errorMessage = responseObject.errorMessage;
  console.log(`Status: ${errorMessage}`);
};

const onMessageArrived = (message) => {
  const uuid = message.payloadString;
  const topic = message.destinationName;
  console.log(`Topic -> ${topic} -> uuid -> ${uuid}`);

  if (topic === mqttConfig.topic) {
    if(uuid != 'test message'){
      tagInput.val(uuid.trim().split("-")[1]);
    }
  }
};

const mqtt = mqttConnect();
mqtt.onConnectionLost = onConnectionLost;
mqtt.onMessageArrived = onMessageArrived;

const onSuccess = () => {
  mqtt.subscribe(mqttConfig.topic, {qos: 1});
};

const onFailure = (message) => {
  console.log(`Connection failed: ${message.errorMessage}`);
};

const connect = () => {
  const options = {
    timeout: 3,
    onSuccess: onSuccess,
    onFailure: onFailure
  };
  mqtt.connect(options);
};

connect();

///////////////////////////////////////////////////////////////////////

const Tags = {
  all: () => {
    return http.get(endpoints.tags);
  },
  get: (id) => {
    return http.get(`${endpoints.tags}/${id}`);
  },
  create: (data) => {
    return http.post(endpoints.tags, data);
  },
  update: (id, data) => {
    return http.put(`${endpoints.tags}/${id}`, data);
  },
  remove: (id) => {
    return http.delete(`${endpoints.tags}/${id}`);
  }
};

const Classes = {
  all: () => {
    return http.get(endpoints.classrooms);
  },
  getPermitidas:(id) =>{
    return http.get(`${endpoints.classrooms}/tag/${id}`);
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

const updateTable = () => {
  Tags.all()
    .then((tags) => tags.data)
    .then((tags) => {
      let table = '';

      tags.forEach((tag) => {
        table += `<tr>`;
        table += `<td>${tag.id}</td>`;
        table += `<td>${tag.id_user}</td>`;
        table += `<td>${tag.tag}</td>`;
        table += `<td class="has-text-centered"><span class="tag ${tag.state ? 'is-success' : 'is-black'}">${tag.state ? 'Ativada' : 'Desativada'}</span></td>`;
        table += `<td class="has-text-centered edit" data-id="${tag.id}"><span class="icon"><i class="fa fa-edit"></i></span></td>`;
        table += `<td class="has-text-centered remove" data-id="${tag.id}"><span class="icon"><i class="fa fa-trash-o"></i></span></td>`;
        table += `</tr>`;
      });
      tagsTable.innerHTML = table;
    })
    .catch((err) => console.log);
};

const resetForm = () => {
  idInput.val('');
  tagInput.val('');
  usuarioSelect.val('');
  stateChebox.attr("checked", false);
  updateClasses([]);
  

  updateTable();

  $('html').removeClass('is-clipped');
  $('#modal-ter').removeClass('is-active');
};

const createOrUpdate = () => {
  const id = idInput.val();

  const data = {
    tag: tagInput.val(),
    user: usuarioSelect.val(),
    salas: getSalas(),
    state: stateChebox.is(':checked') ? 1 : 0
  };
  
  if (id) {
    return Tags.update(id, data)
      .then((tag) => successMessage('Tag atualizada com sucesso'))
      .then((tag) => resetForm())
      .catch((err) => dangerMessage(err));
  }

  return Tags.create(data)
    .then((tag) => successMessage('Tag criada com sucesso'))
    .then((tag) => resetForm())
    .catch((err) => dangerMessage(err));
};

const remove = (id) => {
  Tags.remove(id)
    .then((user) => successMessage('Removida com sucesso'))
    .then((user) => updateTable())
    .catch((err) => dangerMessage(err));
};

$(document).ready(() => {
  updateTable();
  $('.create-tag').on('click', function (e) {

    createOrUpdate();

    return false;
  });

  $('.new-tag').on('click', function (e) {

    resetForm();
    $('html').addClass('is-clipped');
    $('#modal-ter').addClass('is-active');

    return false;
  });


  $('.write-tag').on('click', function (e) {
    Users.get(usuarioSelect.val())
            .then((user) => user.data)
            .then((user) => user.matricula)
            .then((user) => mqtt.send("/smartaccess/denis/catraca/write", make(user)));

    

    return false;
  });

  $(document).on('click', '.remove', function (e) {
    e.preventDefault();

    const id = $(this).data('id');
    remove(id);
    return false;
  });

  $(document).on('click', '.edit', function (e) {
    e.preventDefault();
    
    const id = $(this).data('id');

    const target = $('.modal-button').data('target');

    Tags.get(id)
      .then((tag) => tag.data)
      .then((tag) => {
        idInput.val(tag.id);
        tagInput.val(tag.tag);
        usuarioSelect.val(tag.id_user);
        stateChebox.prop('checked', tag.state);

        $('html').addClass('is-clipped');
        $(target).addClass('is-active');
      })
      .catch((err) => console.log(err));
    
    Classes.getPermitidas(id)
      .then((classrooms) => classrooms.data)
      .then(classrooms => 
        classrooms.map((classes) => {
        return classes.id_classroom;
      }))
      .then(classrooms =>updateClasses(classrooms))
      .catch((err) => console.log(err));
  
    
    return false;
  });
});
//////////////////////

const carregaTela = () =>{
  updateUsers();
  updateClasses([]);
}

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
      .then(classrooms => 
        classrooms.map((classes) => {
        return classes.id;
      }))
      .then(classrooms => carregaSalas(classrooms,permitidas))
      .catch((err) => console.log(err));
}

///////////////////

function carregaSalas(salas,salasPermitidas){
  var output="";
  var marcado = '';
  var edicao = false;
  var inputSalas = document.getElementById("salas")

  if(salasPermitidas.length > 0){
    edicao = true;
    document.getElementById("salas").innerHTML="";
  }

  output += '<p class="control"><label>Salas:'

  salas.forEach(i => {
    marcado = '';

    if(edicao && salasPermitidas.includes(i)){
      marcado = 'checked';
    }
    // cria a opção com a nova opção a ser inserida na caixa de seleção
    output += '<input style="margin-left: 10px; margin-right: 5px;" type="checkbox" name="sala" id='+i+' value="0" '+marcado+'>Lab '+i+'</input>' 
  });
  
  output +=  '</a></label></p>'

  inputSalas.innerHTML=output;
  getSalas();
}

function getSalas(){
  var checkbox = document.getElementsByName('sala');
  var salas = [];

  for (var i = 0, length = checkbox.length; i < length; i++){
    if (checkbox[i].checked){
      salas.push(Number(checkbox[i].id));
    }
  }
  
  return salas;
}

function disabledWrite(){
  
  if(usuarioSelect.val()){
    document.getElementById('writeTag').removeAttribute("disabled");
  }else{
    document.getElementById('writeTag').setAttribute("disabled", "true");
  }

}
///////////////////////////////////////////

var myMap = new Map();

// configurando os valores
myMap.set("0", "!");
myMap.set("1", "@");
myMap.set("2", ",");
myMap.set("3", "$");
myMap.set("4", "%");
myMap.set("5", "&");
myMap.set("6", "*");
myMap.set("7", "(");
myMap.set("8", ".");
myMap.set("9", ")");

myMap.set("a", "'");
myMap.set("A", "_");
myMap.set("b", "+");
myMap.set("B", "=");
myMap.set("c", "[");
myMap.set("C", "{");
myMap.set("ç", "a");
myMap.set("Ç", "z");
myMap.set("d", "]");
myMap.set("D", "}");
myMap.set("e", ":");
myMap.set("E", ">");
myMap.set("f", ";");
myMap.set("F", "<");
myMap.set("g", "/");
myMap.set("G", "?");
myMap.set("h", "|");
myMap.set("H", "1");
myMap.set("i", "9");
myMap.set("I", "0");
myMap.set("j", "2");
myMap.set("J", "3");
myMap.set("k", "8");
myMap.set("K", "4");
myMap.set("l", "7");
myMap.set("L", "5");
myMap.set("m", "6");
myMap.set("M", "b");
myMap.set("n", "y");
myMap.set("N", "c");
myMap.set("o", "x");
myMap.set("O", "d");
myMap.set("p", "w");
myMap.set("P", "e");
myMap.set("q", "v");
myMap.set("Q", "f");
myMap.set("r", "g");
myMap.set("R", "u");
myMap.set("s", "h");
myMap.set("S", "t");
myMap.set("t", "i");
myMap.set("T", "s");
myMap.set("u", "j");
myMap.set("U", "r");
myMap.set("v", "l");
myMap.set("V", "q");
myMap.set("w", "m");
myMap.set("W", "£");
myMap.set("x", "n");
myMap.set("X", "¢");
myMap.set("y", "o");
myMap.set("Y", "§");
myMap.set("z", "p");
myMap.set("Z", "¬");

const make = (mat) => {
    hash = "";

    for(let i=0; i<mat.length;i++){
        hash += myMap.get(mat.charAt(i))
    }
    return hash;
};
