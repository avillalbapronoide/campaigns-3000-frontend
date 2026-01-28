import { expect } from '@wdio/globals'

describe('Configuración', () => {
    describe.skip('Datos de Usuario', () => {
        it('debería mostrar la sección expandida por defecto')

        it('debería mostrar el nombre de usuario actual')

        it('debería mostrar el email como solo lectura')

        it('debería actualizar el nombre de usuario correctamente')

        it('debería mostrar mensaje de éxito tras guardar cambios')
    })

    describe.skip('Cambiar Contraseña', () => {
        it('debería expandir la sección al hacer clic')

        it('debería cambiar la contraseña con datos válidos')

        it('debería mostrar error si la contraseña actual es incorrecta')

        it('debería mostrar error si las contraseñas no coinciden')

        it('debería mostrar error si la nueva contraseña tiene menos de 6 caracteres')
    })

    describe('Tarjetas de Crédito', () => {
        beforeEach(async () => {
            // Login con usuario que tiene tarjetas guardadas
            await browser.url('http://localhost:4200')
            await $('[formcontrolname="username"]').setValue('kozinski')
            await $('[formcontrolname="password"]').setValue('kozinski')
            await $('button[type="submit"]').click()

            // Esperar a que el login está completado y redirigido
            await $('header .user-info .badge').waitForDisplayed({ timeout: 5000 })

            // Navegar a settings
            await browser.url('http://localhost:4200/settings')

            // Expandir sección de tarjetas usando selector de texto parcial
            const cardSectionHeader = await $('span=Tarjetas de Crédito')
            const parentButton = await cardSectionHeader.parentElement()
            const sectionButton = await parentButton.parentElement()
            await sectionButton.click()
            await browser.pause(500) // Esperar animación
        })

        afterEach(async () => {
            await browser.execute(() => localStorage.clear())
        })

        it('debería mostrar la lista de tarjetas guardadas', async () => {
            // Primero añadir una tarjeta si no hay ninguna
            const cardsListInitial = await $('.cards-list')
            if (!(await cardsListInitial.isExisting())) {
                // Añadir una tarjeta
                const addCardButton = await $('button.add-card-btn')
                await addCardButton.click()
                await $('#cardNumber').setValue('4242 4242 4242 4242')
                await $('#expiry').setValue('12/28')
                await $('#cvv').setValue('123')
                await $('button[type="submit"]*=Guardar Tarjeta').click()
                await browser.pause(1000)
            }

            // Ahora verificar que existe la lista
            const cardsList = await $('.cards-list')
            await expect(cardsList).toBeExisting()

            const cardItems = await $$('.card-item')
            expect(cardItems.length).toBeGreaterThan(0)
        })

        it('debería mostrar el modal al hacer clic en "Añadir Tarjeta"', async () => {
            const addCardButton = await $('button.add-card-btn')
            await addCardButton.click()

            const modal = await $('.modal')
            await expect(modal).toBeDisplayed()

            const modalTitle = await $('.modal-header h2')
            await expect(modalTitle).toHaveText('Añadir Tarjeta')
        })

        it('debería añadir una nueva tarjeta correctamente', async () => {
            // Contar tarjetas antes
            const cardsBefore = await $$('.card-item')
            const countBefore = cardsBefore.length

            // Abrir modal
            const addCardButton = await $('button.add-card-btn')
            await addCardButton.click()

            // Rellenar formulario
            await $('#cardNumber').setValue('4242 4242 4242 4242')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')

            // Guardar
            const saveButton = await $('button[type="submit"]*=Guardar Tarjeta')
            await saveButton.click()

            // Esperar a que se cierre el modal y se recarguen las tarjetas
            await browser.pause(1000)

            // Verificar que se añadió la tarjeta
            const cardsAfter = await $$('.card-item')
            expect(cardsAfter.length).toBe(countBefore + 1)
        })

        it('debería establecer una tarjeta como predeterminada', async () => {
            // Primero asegurarse de que hay al menos 2 tarjetas para poder predeterminar una
            const cardsInitial = await $$('.card-item')
            if (cardsInitial.length < 2) {
                // Añadir una tarjeta nueva (no predeterminada)
                const addCardButton = await $('button.add-card-btn')
                await addCardButton.click()
                await $('#cardNumber').setValue('1234 5678 9012 3456')
                await $('#expiry').setValue('06/29')
                await $('#cvv').setValue('789')
                await $('button[type="submit"]*=Guardar Tarjeta').click()
                await browser.pause(1000)
            }

            // Buscar un botón "Predeterminar" (solo existe si la tarjeta no es predeterminada)
            const predeterminarButton = await $('button.btn-link=Predeterminar')

            if (await predeterminarButton.isExisting()) {
                await predeterminarButton.click()
                await browser.pause(1000)

                // Verificar que existe un badge de predeterminada (la lista se ha recargado)
                const defaultBadge = await $('.default-badge')
                await expect(defaultBadge).toBeExisting()
                await expect(defaultBadge).toHaveText('Predeterminada')
            }
        })

        it('debería eliminar una tarjeta con confirmación', async () => {
            // Contar tarjetas antes
            const cardsBefore = await $$('.card-item')
            const countBefore = cardsBefore.length

            if (countBefore > 0) {
                // Configurar confirm para que devuelva true
                await browser.execute(() => {
                    window.confirm = () => true
                })

                // Hacer clic en el botón de eliminar de la primera tarjeta
                const deleteButton = await $('.btn-danger-icon')
                await deleteButton.click()

                await browser.pause(500)

                // Verificar que se eliminó
                const cardsAfter = await $$('.card-item')
                expect(cardsAfter.length).toBe(countBefore - 1)
            }
        })

        it('debería mostrar el badge "Predeterminada" en la tarjeta por defecto', async () => {
            // Primero añadir una tarjeta predeterminada si no hay ninguna
            const defaultBadgeInitial = await $('.default-badge')
            if (!(await defaultBadgeInitial.isExisting())) {
                // Añadir una tarjeta como predeterminada
                const addCardButton = await $('button.add-card-btn')
                await addCardButton.click()
                await $('#cardNumber').setValue('5555 5555 5555 4444')
                await $('#expiry').setValue('12/29')
                await $('#cvv').setValue('456')
                // Marcar como predeterminada
                const isDefaultCheckbox = await $('input[formcontrolname="isDefault"]')
                if (await isDefaultCheckbox.isExisting()) {
                    await isDefaultCheckbox.click()
                } else {
                    // Intentar con otro selector
                    const checkbox = await $('.checkbox-label input[type="checkbox"]')
                    await checkbox.click()
                }
                await $('button[type="submit"]*=Guardar Tarjeta').click()
                await browser.pause(1000)
            }

            const defaultBadge = await $('.default-badge')
            await expect(defaultBadge).toBeExisting()
            await expect(defaultBadge).toHaveText('Predeterminada')

            // Verificar que está dentro de una tarjeta con clase "default"
            const defaultCard = await $('.card-item.default')
            await expect(defaultCard).toBeExisting()
        })
    })

    describe.skip('Navegación entre Secciones', () => {
        it('debería colapsar una sección al expandir otra')

        it('debería mantener los datos del formulario al cambiar de sección')
    })
})
