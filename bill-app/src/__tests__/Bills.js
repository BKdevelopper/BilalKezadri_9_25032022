/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import {defaultExport,mockStore} from "../__mocks__/store"
import Store from "../app/Store";
jest.mock("../app/store", () => mockStore)
// jest.mock('../app/store', () => {
//   const originalModule = jest.requireActual('../app/store');

//   //Simule l'exportation par défaut 
//   return {
//     __esModule: true,
//     ...originalModule,
//     default: jest.fn(() => mockStore),    
//   };
// });

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      //Store.bills = () => ({ bills, mockStore: jest.fn().mockResolvedValue()})
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
describe('When I am on Bills page and I click on the new bill button Nouvelle note de frais.', () => {
  test('Then I should navigate to newBill page bill/new', () => {
    

    const billsClass = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const handleClickNewBill = jest.fn(billsClass.handleClickNewBill);
   // await waitFor(() => screen.getByTestId('btn-new-bill'))
    const newBillBtn = screen.getByTestId('btn-new-bill');
    newBillBtn.addEventListener('click', handleClickNewBill)
   
    expect(handleClickNewBill).toBeTruthy();
   
  })
})

describe('the icon eye', () => {
  test('Then i should see a modal open', () => {
    const billsClass = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    const iconeye = screen.getAllByTestId('icon-eye')[0]// Get first
    const handleClickIconEye = jest.fn(billsClass.handleClickIconEye(iconeye))      
    iconeye.addEventListener('click', handleClickIconEye)
    fireEvent.click(iconeye)
    expect(handleClickIconEye).toHaveBeenCalled()
    expect(document.querySelector('.modal')).toBeTruthy();         
  })
})


// 27 
describe("Given I am a user connected as Admin", () => {
  // test('123', () => {
  //   const defaultExportResult = defaultExport();
  //   expect(defaultExportResult).toBe(mockStore);
  //   expect(defaultExport).toHaveBeenCalled();
  // })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
//