import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"
import '@testing-library/jest-dom/extend-expect'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import firestore from "../app/Firestore.js"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  describe("When I upload a file", () => {
    test("Then it should have a valid extension", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, { target: { 
        files: ["../assets/images/avataaars_Girl2.png","avataaars_Girl2.png"]
      }})  

      const validExtensions = ['jpg', 'jpeg', 'png']
      const fileExtension = inputFile.files[1].split('.')

      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      expect(validExtensions).toContain(fileExtension[1])
      const form = screen.getByTestId("form-new-bill")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile)
      expect(handleChangeFile).toHaveBeenCalled()


      // UTILISATION DES OBJETS {} FIRESTORE...

    })
  })

  describe("When I do not fill fields and I click on submit button", () => {
    test("Then it should not submit the form", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore : null, localStorage: window.localStorage
      })
      const inputDate = screen.getByTestId('datepicker').value
      const inputAmount = screen.getByTestId('amount').value
      const inputPct = screen.getByTestId('pct').value
      const inputFile = screen.getByTestId('file').value
      expect(inputDate).toBe("")
      expect(inputAmount).toBe("")
      expect(inputPct).toBe("")
      expect(inputFile).toBe("")
      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(e => e.preventDefault())  
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form) 
      expect(form).toBeTruthy() 
    })
  })
  describe("When I fill fields and I click on submit button", () => {
    test("Then required fields should be filled", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const inputDate = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputPct = screen.getByTestId('pct')
      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputDate, { target: { value: '2021-05-20'}})
      fireEvent.change(inputAmount, { target: { value: "80" } })      
      fireEvent.change(inputPct, { target: { value: "20" } }) 
      fireEvent.change(inputFile, { target: { files: ["../assets/images/avataaars_Girl2.png","avataaars_Girl2.png"]}})  
      
      expect(inputDate.value).not.toBe("")
      expect(inputAmount.value).not.toBe("")
      expect(inputPct.value).not.toBe("")
      expect(inputFile.files[0]).not.toBe("")
      const firestore = null
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()          
    })
  })
})
// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Add bill to mock API POST", async () => {
      const getSpyPost = jest.spyOn(firebase, "post");
      const newBill = {
        id: "eoKIpYhECmaZAGRrHjaC",
        status: "refused",
        pct: 10,
        amount: 500,
        email: "john@doe.com",
        name: "Facture 236",
        vat: "60",
        fileName: "preview-facture-free-201903-pdf-1.jpg",
        date: "2021-03-13",
        commentAdmin: "à valider",
        commentary: "A déduire",
        type: "Restaurants et bars",
        fileUrl: "https://saving.com",
      };
       const bills = await firebase.post(newBill)
       expect(postSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(5)
    })
    test("it should add bill from an API but fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("It should add bill from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
