const todos = (state = [], action) => {
  switch (action.type) {
    case 'REFRESH':
      return action.list
    case 'ADD_TODO':
      return [
        ...state,
        action.item
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        (todo.id === action.id)
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    default:
      return state
  }
}

export default todos
