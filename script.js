const LLAVE_TOKEN = 'ids'; // llave para localstorage
const ESTATUS_PROGRESO = 'progreso'; //tareas en progreso
const ESTATUS_REVISION = 'revision'; //tareas en revision
const ESTATUS_TERMINADA = 'terminada'; //tareas terminadas

let tareas = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarTareas();
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
        estatus: ESTATUS_PROGRESO // por defecto al crear la tarea
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
function render() {
    const tareas_todas = document.querySelector('.tareas');
    const tareas_progreso = document.querySelector('.tareas_progreso');
    const tareas_revision = document.querySelector('.tareas_revision');
    const tareas_terminada = document.querySelector('.tareas_terminada');


    // limpiar contenido generado por JS
    tareas_todas.innerHTML = '';
    tareas_progreso.innerHTML = '';
    tareas_revision.innerHTML = '';
    tareas_terminada.innerHTML = '';

    for (let i = 0; i < tareas.length; i++) {
        const t = tareas[i];

        // siempre en todas
        tareas_todas.appendChild(createTaskElement(t));

        // y en la columna según estatus
        if (t.estatus === ESTATUS_PROGRESO && tareas_progreso) {
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
function setupDropZones() {
    const zonas = [
        { selector: '.tareas', status: null },
        { selector: '.tareas_progreso', status: ESTATUS_PROGRESO },
        { selector: '.tarea_progreso', status: ESTATUS_PROGRESO }, // fallback
        { selector: '.tareas_revision', status: ESTATUS_REVISION },
        { selector: '.tareas_terminada', status: ESTATUS_TERMINADA },
        { selector: '.tareas_hechas', status: ESTATUS_TERMINADA } // fallback
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