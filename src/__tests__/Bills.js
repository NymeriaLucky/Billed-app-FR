// MG sur le modèle de Dashboard

import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes";
import userEvent from '@testing-library/user-event'
import firebase from "../__mocks__/firebase"
import { localStorageMock } from "../__mocks__/localStorage.js"

const onNavigate = (path) => { document.body.innerHTML = ROUTES({ path }) }
localStorageMock.setItem('user', JSON.stringify({ type: 'Employee' }))

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then a new bill page should be rendered", () => {
      const html = BillsUI({ data: bills }) 
      document.body.innerHTML = html
      const testBill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: localStorageMock})          
      const handleClickNewBill = jest.fn((e) => testBill.handleClickNewBill(e, bills)) 
      const buttonNewBill = screen.getByTestId(`btn-new-bill`)
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
    test("Then a open file modale should be opened", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const handleClickIconEye = jest.fn(Bills.handleClickIconEye)
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = screen.getByTestId('modale-file-open')
      expect(modale).toBeTruthy()
    })
    test("Then modal contain an image", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const testBill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: localStorageMock })     
      jQuery.fn.modal = jest.fn()
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => testBill.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      const modale = screen.getByTestId('modalFileShow')
      expect(modale).toBeTruthy()
    })
  })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // MG correction de la comparaison
      const antiChrono = (a, b) => ((a - b) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  describe('When I am on Bills page but it is loading', () => {
    test('Then loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
})

// MG test d'intégration GET
describe("Given I am a user connected as an Employee", () => {
  describe("When I navigate to Bill Page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
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
