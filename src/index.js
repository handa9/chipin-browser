import "babel-polyfill";
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './components/App'
import reducer from './reducers'
import { addTodo } from './actions'
import { ResourceNode, ServiceEngine } from '@chip-in/resource-node';
import Dadget from '@chip-in/dadget';

const store = createStore(reducer)
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

//let node = new ResourceNode("http://localhost:3000", "alert-editor")
let node = new ResourceNode("http://test-core.chip-in.net", "alert-editor")
window.node = node

class alertEditor extends ServiceEngine {

}
Dadget.registerServiceClasses(node);
node.registerServiceClasses({ alertEditor })

node.start().then(() => {
  let seList = node.searchServiceEngine("Dadget", { database: "alerts" });
  if (seList.length != 1) {
    throw new Error("Dadgetエラー:" + seList.length)
  }
  let dadget = seList[0];
  window.dadget = dadget
  dadget.query({ alertClass: "EvacuationOrder", date: { $gt: "2017-08-07T10:23:00" } }, { title: -1 }, null, null, 10, "latest")
    .then((result) => {
      //検索完了後の処理
      let list = []
      console.log("aaaaaa")
      console.dir(result)
      for (let row of result.resultSet) {
        list.push({
          id: row._id,
          csn: row.csn,
          text: row.title.toString(),
          completed: row.completed,
          org: row
        })
      }
      store.dispatch({
        type: 'REFRESH',
        list: list
      })
    });
  dadget.addUpdateListener((csn) => {
    console.log("bbbbb")
    dadget.query({ alertClass: "EvacuationOrder", date: { $gt: "2017-08-07T10:23:00" } }, { title: -1 }, null, null, csn)
      .then((result) => {
        //検索完了後の処理
        let list = []
        for (let row of result.resultSet) {
          list.push({
            id: row._id,
            csn: row.csn,
            text: row.title.toString(),
            completed: row.completed,
            org: row
          })
        }
        store.dispatch({
          type: 'REFRESH',
          list: list
        })
      });
  })

  window.insertDemo = function (data) {
    let id = Dadget.uuidGen();
    dadget.exec(0, {
      type: "insert",
      target: id,
      new: {
        // 任意のオブジェクト
        alertClass: "EvacuationOrder",
        date: "2017-08-07T10:23:24",
        title: data,
        completed: false,
        distributionId: Dadget.uuidGen()
      }
    })
      .then(result => {
        console.log("hhhhhhhhhhhhh")
        dadget.query({ alertClass: "EvacuationOrder", date: { $gt: "2017-08-07T10:23:00" } }, { title: -1 })
            // 登録に成功したときの処理
        store.dispatch({
          type: 'ADD_TODO',
          item: {
            id: result._id,
            csn: result.csn,
            text: result.title,
            completed: result.completed,
            org: result
          }
        })
      })
      .catch(reason => {
        console.log("insertDemo faild")
      })
  }

  window.updateDemo = function (obj) {
    console.log("updateDemo")
    console.dir(obj)
    dadget.exec(obj.csn, {
      type: "update",
      target: obj.id,
      before: obj.org,
      operator: {
        "$set": {
          "completed": !obj.completed
        }
      }
    })
      .then(result => {
      })
      .catch(reason => {
        console.log("updateDemo faild")
      })
  }
})


