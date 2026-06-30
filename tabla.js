document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-contacto');
    const cuerpoTabla = document.getElementById('cuerpo-tabla-mensajes');
    const mensajesGuardados = localStorage.getItem('mensajes');
    let mensajes = mensajesGuardados ? JSON.parse(mensajesGuardados) : [];

    // Función para mostrar los mensajes en la tabla
    function mostrarMensajes() {
        cuerpoTabla.innerHTML = ''; // Limpiar la tabla
        mensajes.forEach(mensaje => {
            const fila = cuerpoTabla.insertRow();
            const celdaNombre = fila.insertCell();
            const celdaMensaje = fila.insertCell();
            celdaNombre.textContent = mensaje.nombre;
            celdaMensaje.textContent = mensaje.mensaje;
        });
    }

    // Mostrar los mensajes guardados al cargar la página
    mostrarMensajes();

    formulario.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar el envío tradicional del formulario

        const nombre = document.getElementById('nombre').value;
        const mensaje = document.getElementById('mensaje').value;

        if (nombre && mensaje) {
            mensajes.push({ nombre: nombre, mensaje: mensaje });
            localStorage.setItem('mensajes', JSON.stringify(mensajes));
            mostrarMensajes();
            formulario.reset(); // Limpiar el formulario
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });
});