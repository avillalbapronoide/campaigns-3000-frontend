import { expect } from '@wdio/globals'

describe('Autenticación', () => {
    describe.only('Login', () => {
        beforeEach(async () => {
            await browser.url('http://localhost:4200')
        })

        afterEach(async () => {
            await browser.execute(() => localStorage.clear())
        })

        it('debería de mostrar el error "Invalid credentials" al loguearte con un usuario invalido', async () => {
            await $('[formcontrolname="username"]').setValue('no-existe')
            await $('[formcontrolname="password"]').setValue('no-existe')
            await $('button[type="submit"]').click()

            const error = await $('div.badge.badge-danger')
            await expect(error).toBeDisplayed()
            await expect(error).toHaveText('INVALID CREDENTIALS')
        })

        it('debería mostrar la etiqueta "Admin" al loguearte con el usuario cfalco', async () => {
            await $('[formcontrolname="username"]').setValue('cfalco')
            await $('[formcontrolname="password"]').setValue('cfalco')
            await $('button[type="submit"]').click()

            const badge = await $('header .user-info .badge')
            await expect(badge).toHaveText('ADMIN')
        })

        it('debería mostrar la etiqueta "User" al loguearte con el usuario kozinski', async () => {
            await $('[formcontrolname="username"]').setValue('kozinski')
            await $('[formcontrolname="password"]').setValue('kozinski')
            await $('button[type="submit"]').click()

            const badge = await $('header .user-info .badge')
            await expect(badge).toHaveText('USER')
        })
    })

    describe('Login', () => {
        it('debería iniciar sesión con credenciales válidas y redirigir al dashboard/campañas', async () => {


        })

        it('debería mostrar error al iniciar sesión con credenciales inválidas', async () => {

        })

        it('debería mostrar validación cuando el campo usuario está vacío', async () => {

        })

        it('debería mostrar validación cuando el campo contraseña está vacío', async () => {

        })
    })

    describe('Registro', () => {
        beforeEach(async () => {
            await browser.url('/register')
        })

        afterEach(async () => {
            await browser.execute(() => localStorage.clear())
        })

        it('debería registrar un nuevo usuario con datos válidos y redirigir al dashboard', async () => {
            const timestamp = Date.now()
            await $('#username').setValue(`nuevoUsuario${timestamp}`)
            await $('#email').setValue(`nuevo${timestamp}@test.com`)
            await $('#password').setValue('password123')
            await $('#confirmPassword').setValue('password123')
            await $('button[type="submit"]').click()

            await expect(browser).toHaveUrl(expect.stringContaining('/dashboard'))
        })

        it('debería mostrar error cuando el usuario ya existe', async () => {
            await $('#username').setValue('cfalco')
            await $('#email').setValue('cfalco@example.com')
            await $('#password').setValue('password123')
            await $('#confirmPassword').setValue('password123')
            await $('button[type="submit"]').click()

            const error = await $('div.badge.badge-danger')
            await expect(error).toBeDisplayed()
        })

        it('debería mostrar validación cuando las contraseñas no coinciden', async () => {
            await $('#password').setValue('password123')
            await $('#confirmPassword').setValue('otraPassword')
            await $('#confirmPassword').click()
            await $('body').click()

            const error = await $('span.error-text=Las contraseñas no coinciden')
            await expect(error).toBeDisplayed()
        })

        it('debería mostrar validación de email inválido', async () => {
            await $('#email').setValue('email-invalido')
            await $('body').click()

            const error = await $('span.error-text=Email inválido')
            await expect(error).toBeDisplayed()
        })

        it('debería mostrar validación de contraseña mínima (6 caracteres)', async () => {
            await $('#password').setValue('123')
            await $('body').click()

            const error = await $('span.error-text=Contraseña requerida (mínimo 6 caracteres)')
            await expect(error).toBeDisplayed()
        })
    })

    describe('Navegación', () => {
        it('debería navegar de login a registro con el enlace "Regístrate aquí"')

        it('debería navegar de registro a login con el enlace "Inicia sesión aquí"')
    })
})
