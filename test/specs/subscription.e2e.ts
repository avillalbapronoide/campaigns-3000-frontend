import { $, browser, expect } from '@wdio/globals'
import { execSync } from 'child_process'
import path from 'path'

const resetDatabase = () => {
    // En CI: API_PATH apunta a la carpeta 'api'. En local: usa la ruta relativa por defecto
    const apiPath = process.env['API_PATH'] || path.resolve(__dirname, '../../../campaigns-3000-api')
    const dbPath = path.join(apiPath, 'newsletter.db')
    const sqlPath = path.join(apiPath, 'reset_db.sql')
    execSync(`sqlite3 "${dbPath}" < "${sqlPath}"`)
}

describe('Suscripción y Pagos', () => {
    beforeEach(async () => {
        resetDatabase()
    })

    describe('Formulario de Suscripción', () => {
        beforeEach(async () => {
            await browser.url('/login')
            await $('#username').setValue('aperez')
            await $('#password').setValue('aperez')
            await $('button[type="submit"]').click()
            await browser.url('/subscription')
        })

        it('debería mostrar los campos de nombre y email prellenados si el usuario está logueado', async () => {
            const nameField = await $('#name')
            const emailField = await $('#email')

            await expect(nameField).toHaveValue('aperez')
            await expect(emailField).toHaveValue('aperez@example.com')
        })

        it('debería mostrar todas las categorías disponibles', async () => {
            const categorias = ['tecnología', 'programación', 'ia', 'negocios', 'marketing', 'diseño', 'blockchain', 'datos']

            for (const categoria of categorias) {
                const checkbox = await $(`input[type="checkbox"][value="${categoria}"]`)
                await expect(checkbox).toBeExisting()
            }
        })

        it('debería calcular el precio de 4.99€ al seleccionar 1 categoría', async () => {
            const checkboxTecnologia = await $('input[type="checkbox"][value="tecnología"]')
            await checkboxTecnologia.click()

            const precioDisplay = await $('.form-group div[style*="font-size: 1.5rem"]')
            await expect(precioDisplay).toHaveText('4.99€ / mes')
        })

        it('debería calcular el precio de 10.99€ al seleccionar 4 categorías', async () => {
            const categorias = ['tecnología', 'programación', 'ia', 'negocios']
            for (const cat of categorias) {
                const checkbox = await $(`input[type="checkbox"][value="${cat}"]`)
                await checkbox.click()
            }

            const precioDisplay = await $('.form-group div[style*="font-size: 1.5rem"]')
            await expect(precioDisplay).toHaveText('10.99€ / mes')
        })

        it('debería calcular el precio de 11.99€ al seleccionar 5 categorías', async () => {
            const categorias = ['tecnología', 'programación', 'ia', 'negocios', 'marketing']
            for (const cat of categorias) {
                const checkbox = await $(`input[type="checkbox"][value="${cat}"]`)
                await checkbox.click()
            }

            const precioDisplay = await $('.form-group div[style*="font-size: 1.5rem"]')
            await expect(precioDisplay).toHaveText('11.99€ / mes')
        })

        it('debería calcular el precio de 14.99€ al seleccionar 8 categorías (todas)', async () => {
            const categorias = ['tecnología', 'programación', 'ia', 'negocios', 'marketing', 'diseño', 'blockchain', 'datos']
            for (const cat of categorias) {
                const checkbox = await $(`input[type="checkbox"][value="${cat}"]`)
                await checkbox.click()
            }

            const precioDisplay = await $('.form-group div[style*="font-size: 1.5rem"]')
            await expect(precioDisplay).toHaveText('14.99€ / mes')
        })

        it('debería mostrar los datos de tarjetas de prueba', async () => {
            const tarjetaCorrecta = await $('span=4242 4242 4242 4242')
            const tarjetaDeclinada = await $('span=4000 0000 0000 0002')

            await expect(tarjetaCorrecta).toBeExisting()
            await expect(tarjetaDeclinada).toBeExisting()
        })
    })

    describe('Pago Exitoso', () => {
        beforeEach(async () => {
            await browser.url('/login')
            await $('#username').setValue('aperez')
            await $('#password').setValue('password123')
            await $('button[type="submit"]').click()
            await browser.url('/subscription')
        })

        it('debería completar la suscripción con la tarjeta de prueba válida (4242 4242 4242 4242)', async () => {
            await $('input[type="checkbox"][value="tecnología"]').click()

            await $('#cardNumber').setValue('4242 4242 4242 4242')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')

            await $('button[type="submit"]').click()

            await expect($('.badge-success')).toBeExisting()
        })

        it('debería mostrar la vista de suscripción activa tras el pago', async () => {
            await $('input[type="checkbox"][value="tecnología"]').click()
            await $('#cardNumber').setValue('4242 4242 4242 4242')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const tituloSuscripcion = await $('h2=Mi Suscripción')
            await expect(tituloSuscripcion).toBeExisting()
        })

        it('debería mostrar el banner verde de "Suscripción Activa"', async () => {
            await $('input[type="checkbox"][value="tecnología"]').click()
            await $('#cardNumber').setValue('4242 4242 4242 4242')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const bannerActiva = await $('strong=Suscripción Activa')
            await expect(bannerActiva).toBeExisting()
        })
    })

    describe('Errores de Pago', () => {
        beforeEach(async () => {
            await browser.url('/login')
            await $('#username').setValue('aperez')
            await $('#password').setValue('password123')
            await $('button[type="submit"]').click()
            await browser.url('/subscription')
            await $('input[type="checkbox"][value="tecnología"]').click()
        })

        it('debería mostrar error con tarjeta declinada (4000 0000 0000 0002)', async () => {
            await $('#cardNumber').setValue('4000 0000 0000 0002')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const errorAlert = await $('.error-alert')
            await expect(errorAlert).toBeExisting()
        })

        it('debería mostrar error de fondos insuficientes (4000 0000 0000 0051)', async () => {
            await $('#cardNumber').setValue('4000 0000 0000 0051')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const errorAlert = await $('.error-alert')
            await expect(errorAlert).toBeExisting()
            await expect(errorAlert).toHaveText(expect.stringContaining('insuficientes'))
        })

        it('debería mostrar error de tarjeta expirada (4000 0000 0000 0069)', async () => {
            await $('#cardNumber').setValue('4000 0000 0000 0069')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const errorAlert = await $('.error-alert')
            await expect(errorAlert).toBeExisting()
            await expect(errorAlert).toHaveTextContaining('expirada')
        })

        it('debería mostrar error de procesamiento (4000 0000 0000 0119)', async () => {
            await $('#cardNumber').setValue('4000 0000 0000 0119')
            await $('#expiry').setValue('12/28')
            await $('#cvv').setValue('123')
            await $('button[type="submit"]').click()

            const errorAlert = await $('.error-alert')
            await expect(errorAlert).toBeExisting()
        })
    })

    describe('Tarjetas Guardadas', () => {
        beforeEach(async () => {
            await browser.url('/login')
            await $('#username').setValue('kozinski')
            await $('#password').setValue('password123')
            await $('button[type="submit"]').click()
            await browser.url('/subscription')
        })

        it('debería mostrar las tarjetas guardadas del usuario', async () => {
            const cardSelector = await $('.card-selector')
            await expect(cardSelector).toBeExisting()
        })

        it('debería permitir seleccionar una tarjeta guardada', async () => {
            const cardOption = await $('.card-option')
            await cardOption.click()

            await expect(cardOption).toHaveElementClass('selected')
        })

        it('debería permitir usar otra tarjeta con "Usar otra tarjeta"', async () => {
            const usarOtraTarjeta = await $('.card-option-new')
            await usarOtraTarjeta.click()

            const cardNumberInput = await $('#cardNumber')
            await expect(cardNumberInput).toBeExisting()
            await expect(cardNumberInput).toHaveValue('')
        })
    })

    describe('Cancelación de Suscripción', () => {
        beforeEach(async () => {
            await browser.url('/login')
            await $('#username').setValue('kozinski')
            await $('#password').setValue('password123')
            await $('button[type="submit"]').click()
            await browser.url('/subscription')
        })

        it('debería mostrar confirmación al hacer clic en "Cancelar Suscripción"', async () => {
            const cancelButton = await $('button*=Cancelar Suscripción')

            await browser.execute(() => {
                window.confirm = () => false
            })

            await cancelButton.click()
            const bannerActiva = await $('strong=Suscripción Activa')
            await expect(bannerActiva).toBeExisting()
        })

        it('debería cambiar el estado a período de gracia tras cancelar', async () => {
            await browser.execute(() => {
                window.confirm = () => true
            })

            const cancelButton = await $('button*=Cancelar Suscripción')
            await cancelButton.click()

            await browser.pause(1000)

            const bannerCancelada = await $('strong=Suscripción Cancelada')
            await expect(bannerCancelada).toBeExisting()
        })

        it('debería mostrar el banner naranja de "Suscripción Cancelada"', async () => {
            await browser.execute(() => {
                window.confirm = () => true
            })

            const cancelButton = await $('button*=Cancelar Suscripción')
            await cancelButton.click()

            await browser.pause(1000)

            const bannerCancelada = await $('strong=Suscripción Cancelada')
            await expect(bannerCancelada).toBeExisting()
        })

        it('debería mostrar la fecha de fin de acceso', async () => {
            await browser.execute(() => {
                window.confirm = () => true
            })

            const cancelButton = await $('button*=Cancelar Suscripción')
            await cancelButton.click()

            await browser.pause(1000)

            const accesoHasta = await $('label*=Acceso hasta')
            await expect(accesoHasta).toBeExisting()
        })
    })
})
