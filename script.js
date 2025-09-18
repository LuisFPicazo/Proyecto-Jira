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
// createCard('Cambiar de color el boton del formularo x', 'Desarrollo')