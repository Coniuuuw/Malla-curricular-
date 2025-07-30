// Espera a que todo el contenido del HTML se haya cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // Selecciona todos los elementos que representan un ramo.
    const ramos = document.querySelectorAll('.ramo');
    // Define la clave que se usará para guardar los datos en el localStorage del navegador.
    const localStorageKey = 'ramosAprobadosEnfermeria';

    /**
     * Carga el estado de los ramos aprobados desde el localStorage.
     * @returns {Set<string>} Un Set con los IDs de los ramos aprobados.
     */
    function cargarRamosAprobados() {
        const ramosGuardados = localStorage.getItem(localStorageKey);
        // Si hay datos guardados, los convierte de string a un Set. Si no, crea un Set vacío.
        return ramosGuardados ? new Set(JSON.parse(ramosGuardados)) : new Set();
    }

    /**
     * Guarda el estado actual de los ramos aprobados en el localStorage.
     * @param {Set<string>} aprobados - El Set con los IDs de los ramos aprobados.
     */
    function guardarRamosAprobados(aprobados) {
        // Convierte el Set a un Array y luego a un string JSON para guardarlo.
        localStorage.setItem(localStorageKey, JSON.stringify(Array.from(aprobados)));
    }

    // Carga los ramos aprobados al iniciar la página.
    const ramosAprobados = cargarRamosAprobados();

    /**
     * Actualiza la interfaz de usuario para reflejar el estado actual de los ramos (bloqueado, aprobado, etc.).
     */
    function actualizarEstadoVisual() {
        ramos.forEach(ramo => {
            const idRamo = ramo.id;
            const requisitosAttr = ramo.dataset.requisitos;
            let requisitosFaltantes = [];

            // 1. Verifica si el ramo tiene requisitos.
            if (requisitosAttr) {
                const listaRequisitos = requisitosAttr.split(',');
                // Comprueba si cada requisito está en la lista de aprobados.
                requisitosFaltantes = listaRequisitos.filter(reqId => !ramosAprobados.has(reqId.trim()));
            }

            // 2. Aplica los estilos correspondientes.
            if (requisitosFaltantes.length > 0) {
                // Si faltan requisitos, el ramo está bloqueado.
                ramo.classList.add('bloqueado');
                ramo.classList.remove('aprobado'); // No puede estar aprobado si está bloqueado.
                // Asegurarse de que el ID se quite de la lista de aprobados si se des-aprueba un prerrequisito
                if (ramosAprobados.has(idRamo)) {
                    ramosAprobados.delete(idRamo);
                }
            } else {
                // Si no faltan requisitos, el ramo está desbloqueado.
                ramo.classList.remove('bloqueado');
                // Si el ramo estaba en la lista de aprobados, se le aplica el estilo.
                if (ramosAprobados.has(idRamo)) {
                    ramo.classList.add('aprobado');
                } else {
                    ramo.classList.remove('aprobado');
                }
            }
        });
        
        // Guarda cualquier cambio que haya surgido de la actualización (ej: un ramo se desbloqueó y se desaprobó).
        guardarRamosAprobados(ramosAprobados);
    }

    /**
     * Maneja el evento de clic en un ramo.
     * @param {Event} event - El evento de clic.
     */
    function manejarClickEnRamo(event) {
        const ramo = event.currentTarget;
        const idRamo = ramo.id;

        // Si el ramo está bloqueado, muestra una alerta y no hace nada más.
        if (ramo.classList.contains('bloqueado')) {
            const requisitosAttr = ramo.dataset.requisitos;
            const listaRequisitos = requisitosAttr.split(',');
            
            const nombresRequisitosFaltantes = listaRequisitos
                .filter(reqId => !ramosAprobados.has(reqId.trim()))
                .map(reqId => {
                    const elRequisito = document.getElementById(reqId.trim());
                    return elRequisito ? elRequisito.textContent : reqId; // Muestra el nombre del ramo.
                });

            alert(`⛔ Ramo bloqueado. Debes aprobar:\n\n• ${nombresRequisitosFaltantes.join('\n• ')}`);
            return;
        }

        // Si el ramo no está bloqueado, cambia su estado (aprobado/no aprobado).
        if (ramosAprobados.has(idRamo)) {
            ramosAprobados.delete(idRamo); // Si ya estaba, lo quita (des-aprobar).
        } else {
            ramosAprobados.add(idRamo); // Si no estaba, lo añade (aprobar).
        }

        // Vuelve a actualizar el estado visual de todos los ramos.
        actualizarEstadoVisual();
    }

    // --- INICIALIZACIÓN ---

    // Añade el detector de clics a cada ramo.
    ramos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickEnRamo);
    });

    // Llama a la función de actualización visual por primera vez para establecer el estado inicial.
    actualizarEstadoVisual();

});
