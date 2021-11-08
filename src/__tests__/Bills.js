import { fireEvent, screen } from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import {activeIcon} from '../app/Router.js'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: []})
      document.body.innerHTML = html

      const icoWin = screen.getByTestId('icon-window')
      expect(icoWin).toBeTruthy()

      const addClass = jest.fn()
      const remClass = jest.fn()
      const activedIcon = {classList:{add:addClass, remove:remClass}}
      activeIcon(activedIcon, activedIcon)      

      expect(addClass.mock.calls.length).toBe(1);
      expect(addClass.mock.calls[0][0]).toBe('active-icon');
     
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((b - a) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  
    describe('When I click on the New Bill button', () => {
      test('Then it should display the New Bill Page', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data:[]})
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const bill = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const handleClickNewBill = jest.fn(bill.handleClickNewBill)
        const buttonNewBill = screen.getByTestId('btn-new-bill')
        expect(buttonNewBill).toBeTruthy()
        buttonNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(buttonNewBill)
        expect(handleClickNewBill).toHaveBeenCalled() 
      })         
    })

    describe('When I click on the icon eye', () => {
      test('Then it should open a modal', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const bill = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const handleClickIconEye = jest.fn(bill.handleClickIconEye)
        const eye = screen.getAllByTestId('icon-eye')[0]
        expect(eye).toBeTruthy()
        eye.addEventListener('click', handleClickIconEye(eye))
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
        const modale = screen.getByTestId('modaleFile')  

        // affiche le modale TO DO

      })
    })
  }) 
  
  // test d'intégration GET
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")       
      const userBills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(userBills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
describe('When I am on Bills page but it is loading', () => {
  test('Then, Loading page should be rendered', () => {
    const html = BillsUI({ loading: true })
    document.body.innerHTML = html
    expect(screen.getAllByText('Loading...')).toBeTruthy()
  })
})
describe('When I am on Bills page but back-end send an error message', () => {
  test('Then, Error page should be rendered', () => {
    const html = BillsUI({ error: 'some error message' })
    document.body.innerHTML = html
    expect(screen.getAllByText('Erreur')).toBeTruthy()
  })

})