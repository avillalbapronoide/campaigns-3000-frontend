import { expect } from '@wdio/globals'

describe('Gestión de Campañas', () => {
    describe('Lista de Campañas', () => {
        it('debería mostrar la tabla de campañas con las columnas ID, Nombre, Categorías, Estado, Fecha y Acciones')

        it('debería mostrar las categorías de cada campaña como etiquetas')

        it('debería mostrar el estado con el badge correspondiente (Enviada, Programada, Borrador)')
    })

    describe('Ver Contenido', () => {
        it('debería abrir un modal con el contenido de la campaña al hacer clic en "Ver contenido"')

        it('debería mostrar el asunto, categorías, estado y contenido en el modal')

        it('debería cerrar el modal al hacer clic en el botón cerrar')
    })

    describe('Editar Campaña', () => {
        it('debería abrir el modal de edición al hacer clic en "Editar" de una campaña borrador')

        it('debería permitir modificar nombre, asunto, contenido y categorías')

        it('debería guardar los cambios y cerrar el modal')
    })

    describe('Eliminar Campaña', () => {
        it('debería mostrar modal de confirmación al hacer clic en "Eliminar"')

        it('debería eliminar la campaña y mostrar notificación de éxito')

        it('debería cancelar la eliminación si se hace clic en "Cancelar"')
    })

    describe('Enviar Campaña', () => {
        it('debería mostrar modal de confirmación al hacer clic en "Enviar"')

        it('debería enviar la campaña y actualizar su estado a "Enviada"')
    })

    describe('Informe de Campaña (Admin)', () => {
        it('debería abrir el modal de informe al hacer clic en "Ver informe"')

        it('debería mostrar el total de destinatarios')

        it('debería mostrar el total de aperturas y tasa de apertura')

        it('debería mostrar información de clicks si el rastreo está habilitado')
    })
})
