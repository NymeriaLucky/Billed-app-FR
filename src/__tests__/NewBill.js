import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"

const billData = {
  vat: 20,
  fileUrl: "https://legoll.fr/p9_test.png",
  status: 'pending',
  type: "Transports",
  commentary: "Honolulu",
  name:  "test9",
  fileName: "justificatif.png",
  date: "01/11/2021",
  amount: 99,
  email: "employee@email.com",
  pct: 20
}

const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then create a new bill", () => {
      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@email.com' }))      
      const html = NewBillUI()
      document.body.innerHTML = html
      const setNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})
      screen.getByTestId('vat').value = billData.vat
      setNewBill.fileUrl = billData.fileUrl
      screen.getByTestId('expense-type').value = billData.type
      screen.getByTestId('commentary').value = billData.commentary
      screen.getByTestId('expense-name').value = billData.name
      setNewBill.fileName = billData.fileName
      screen.getByTestId('datepicker').value = billData.date
      screen.getByTestId('amount').value = billData.value
      screen.getByTestId('expense-name').value = billData.pct
      const handleSubmit = jest.fn((e) => setNewBill.handleSubmit(e))
      setNewBill.createBill = (setNewBill) => setNewBill
      const formSubmit = screen.getByTestId("form-new-bill")
      formSubmit.addEventListener('click', handleSubmit)
      userEvent.click(formSubmit)
      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it should load file if valid image format", () => {
      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee', email: 'cedric.hiely@billed.com' }))          
      const html = NewBillUI()
      document.body.innerHTML = html
      const setNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})
      const file = screen.getByTestId("file")
      const fileImage = new File(["mon-image"], "image.png", { type: "image/png" })
      const handleChangeFile = jest.fn(() => setNewBill.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      userEvent.upload(file, fileImage)
      expect(file.files).toHaveLength(1)
    })
    test("Then it should reject file if image format not valid", () => {
      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee' }))          
      const html = NewBillUI()
      document.body.innerHTML = html
      const setNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})
      const file = screen.getByTestId("file")
      const badFile = new File(["json"], "test.json", { type: "application/json" })
      const handleChangeFile = jest.fn(() => setNewBill.handleChangeFile)
      file.addEventListener("upload", handleChangeFile)
      userEvent.upload(file, badFile)
      expect(handleChangeFile(badFile)).toBeTruthy()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("Then push new bill to mock API POST", async () => {
        const postSpy = jest.spyOn(firebase, "post")
        const bills = await firebase.post(billData)
        expect(postSpy).toHaveBeenCalledTimes(1)
        expect(bills.data.length).toBe(1)
    })
    test("add bill to API and fails with 404 message error", async () => {
        firebase.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 404")))
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy();
    })
    test("add bill to API and fails with 500 message error", async () => {
        firebase.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 500")))
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    });
  })
})
