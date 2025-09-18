const rowToDo = document.getElementById('to-do')
let tasksToDo = []


// Función que crea la estructura de una tarjeta.
// Pide como parámetros datos de tipo string, el primero hace referencia a la descripcion de la tarea
// y el segundo al área que esta emitiendo la tarea que por defecto es "Desarrollo"
function createCard(pDescriptionText, pAreaText = 'Desarrollo') {
    const card = document.createElement('div')
    card.classList.add('card')
    card.id = 'to-do-'+(tasksToDo.length + 1)
    const pDescription = document.createElement('p')
    pDescription.textContent = pDescriptionText
    const divCard = document.createElement('div')
    const pArea = document.createElement('p')
    pArea.textContent = pAreaText
    const buttonDelete = document.createElement('button')
    buttonDelete.id = card.id
    buttonDelete.textContent = 'Eliminar'

    rowToDo.appendChild(card)
    card.appendChild(pDescription)
    card.appendChild(divCard)
    divCard.appendChild(pArea)
    divCard.appendChild(buttonDelete)
}

// Ejemplo de llamada a la función para crear una nueva tarjeta
// createCard('Cambiar de color el boton del formularo x', 'Desarrollo')const LLAVE_TOKEN = 'ids'; // llave para localstorage
const LLAVE_TOKEN = 'ids';//estaba comentada arriba 
const ESTATUS_PROGRESO = 'progreso'; //tareas en progreso
const ESTATUS_REVISION = 'revision'; //tareas en revision
const ESTATUS_TERMINADA = 'terminada'; //tareas terminadas
const ESTATUS_TODO = 'todo';//agregue nuevo estatus

let tareas = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarTareas();
    document.getElementById('to-do')?.classList.add('tareas_todo');
    document.getElementById('in-progress')?.classList.add('tareas_progreso');
    document.getElementById('in-review')?.classList.add('tareas_revision');
    document.getElementById('done')?.classList.add('tareas_terminada');
    //agregue los estados antes de hacer el render
    render();
    setupDropZones();
});

// Abre el modal (solo abre)
function openModal() {
    const modal = document.querySelector('dialog');
    if (modal) modal.showModal();
}

// Guarda la tarea leyendo los inputs, cierra modal, persiste y renderiza
function guardarTarea() {
    const areaInput = document.getElementById('area');
    const descInput = document.getElementById('descripcion');
    const modal = document.querySelector('dialog');

    const area = areaInput?.value?.trim() || '';
    const descripcion = descInput?.value?.trim() || '';

    if (!area || !descripcion) {
        alert('Por favor completa área y descripción');
        return;
    }

    const nueva = {
        id: Date.now().toString(),
        area,
        descripcion,
        estatus: ESTATUS_TODO // cambie el estatus

    };

    tareas.push(nueva);
    saveTareas();
    render();

    // limpiar inputs y cerrar modal
    if (areaInput) areaInput.value = '';
    if (descInput) descInput.value = '';
    if (modal) modal.close();
}

// --- Renderiza las tareas en las columnas ---
// renderizar el arreglo d etareas en (.tareas, .tareas_progreso, .tareas_revision, .tareas_terminada)
//corregi la funcion render
function render() {
    const tareas_todo = document.querySelector('.tareas_todo');
    const tareas_progreso = document.querySelector('.tareas_progreso');
    const tareas_revision = document.querySelector('.tareas_revision');
    const tareas_terminada = document.querySelector('.tareas_terminada');

    if (tareas_todo) tareas_todo.innerHTML = '';
    if (tareas_progreso) tareas_progreso.innerHTML = '';
    if (tareas_revision) tareas_revision.innerHTML = '';
    if (tareas_terminada) tareas_terminada.innerHTML = '';

    for (let i = 0; i < tareas.length; i++) {
        const t = tareas[i];

        if (t.estatus === ESTATUS_TODO && tareas_todo) {
            tareas_todo.appendChild(createTaskElement(t));
        } else if (t.estatus === ESTATUS_PROGRESO && tareas_progreso) {
            tareas_progreso.appendChild(createTaskElement(t));
        } else if (t.estatus === ESTATUS_REVISION && tareas_revision) {
            tareas_revision.appendChild(createTaskElement(t));
        } else if (t.estatus === ESTATUS_TERMINADA && tareas_terminada) {
            tareas_terminada.appendChild(createTaskElement(t));
        }
    }
}


// Crea el div.tarea (DOM) para una tarea
function createTaskElement(tarea) {
    const div = document.createElement('div');
    div.className = 'tarea task-item';
    div.draggable = true;
    div.dataset.id = tarea.id;

    const pDesc = document.createElement('p');
    pDesc.textContent = tarea.descripcion;

    const pArea = document.createElement('p');
    pArea.textContent = tarea.area;

    const pEstatus = document.createElement('p');
    pEstatus.textContent = tarea.estatus;

    div.appendChild(pDesc);
    div.appendChild(pArea);
    div.appendChild(pEstatus);

    // botón eliminar
    const btn = document.createElement('button');
    btn.textContent = 'Eliminar tarea';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(tarea.id);
    });
    div.appendChild(btn);

    // drag & drop
    div.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/plain', tarea.id);
        div.classList.add('dragging');
    });
    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
    });

    return div;
}

// Eliminar tarea por id
function deleteTask(id) {
    const confirmado = confirm('¿Eliminar esta tarea?');
    if (!confirmado) return;
    tareas = tareas.filter(t => t.id !== id);
    saveTareas();
    render();
}

// --- LocalStorage ---
function cargarTareas() {
    try {
        const raw = localStorage.getItem(LLAVE_TOKEN);
        tareas = raw ? JSON.parse(raw) : [];
        // aseguramos que siempre sea array
        if (!Array.isArray(tareas)) tareas = [];
    } catch (e) {
        console.error('Error cargando tareas desde localStorage', e);
        tareas = [];
    }
}

function saveTareas() {
    try {
        localStorage.setItem(LLAVE_TOKEN, JSON.stringify(tareas));
    } catch (e) {
        console.error('Error guardando tareas en localStorage', e);
    }
}

// --- Configura zonas drop para cambiar estatus ---
// La zona ".tareas" (todas) NO cambia el estatus al soltar (solo contiene todas las tarjetas).
//cambie el arreglo de las zonas
function setupDropZones() {
    const zonas = [
    { selector: '.tareas_todo',      status: ESTATUS_TODO },
    { selector: '.tareas_progreso',  status: ESTATUS_PROGRESO },
    { selector: '.tarea_progreso',   status: ESTATUS_PROGRESO }, // fallback
    { selector: '.tareas_revision',  status: ESTATUS_REVISION },
    { selector: '.tareas_terminada', status: ESTATUS_TERMINADA },
    { selector: '.tareas_hechas',    status: ESTATUS_TERMINADA } // fallback
];


    zonas.forEach(z => {
        const el = document.querySelector(z.selector);
        if (!el) return;

        el.addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });

        el.addEventListener('dragenter', (ev) => {
            ev.preventDefault();
            el.classList.add('drop-over');
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('drop-over');
        });

        el.addEventListener('drop', (ev) => {
            ev.preventDefault();
            el.classList.remove('drop-over');
            const id = ev.dataTransfer.getData('text/plain');
            if (!id) return;

            const t = tareas.find(x => x.id === id);
            if (!t) return;

            if (z.status) {
                t.estatus = z.status;
                saveTareas();
                render();
            } else {
                // si la zona es 'todas' (status null) no cambia estatus; igual re-render para refrescar
                render();
            }
        });
    });
}

// exportar funciones globales (tu HTML usa onclick inline)
window.openModal = openModal;
window.guardarTarea = guardarTarea;

// Cerrar el modal al hacer clic en el fondo o con Escape 
const __dlg = document.querySelector('dialog');
if (__dlg) {
  __dlg.addEventListener('click', (e) => {
    if (e.target === __dlg) __dlg.close();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelector('dialog')?.close();
});
