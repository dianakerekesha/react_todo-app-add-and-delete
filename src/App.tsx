/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ERRORS } from './utils/errors';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import { FilterStatus } from './types/FilterStatus';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.All);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);

    setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  const todoInputRef = useRef<HTMLInputElement>(null);

  const addTodo = useCallback(
    async (title: string) => {
      const normalizedTitle = title.trim();

      if (!normalizedTitle) {
        showError(ERRORS.title);
        throw new Error('Empty title');
      }

      setErrorMessage('');
      setIsSubmitting(true);

      const placeholderTodo: Todo = {
        id: 0,
        userId: todoService.USER_ID,
        title: normalizedTitle,
        completed: false,
      };

      setTempTodo(placeholderTodo);

      try {
        const newTodo = await todoService.createTodo({
          userId: todoService.USER_ID,
          title: normalizedTitle,
          completed: false,
        });

        setTodos(prev => [...prev, newTodo]);
      } catch {
        showError(ERRORS.add);
        throw new Error('Failed to add');
      } finally {
        setTempTodo(null);
        setIsSubmitting(false);
        todoInputRef.current?.focus();
      }
    },
    [showError],
  );

  useEffect(() => {
    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => showError(ERRORS.load));
  }, [showError]);

  const onDeleteTodo = useCallback(
    async (todoId: number) => {
      setErrorMessage('');

      setLoadingIds(prev => [...prev, todoId]);

      try {
        await todoService.deleteTodo(todoId);
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      } catch {
        showError(ERRORS.delete);
      } finally {
        setLoadingIds(prev => prev.filter(id => id !== todoId));
      }
    },
    [showError],
  );

  const clearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => onDeleteTodo(todo.id));
  };

  // Compute visible todos based on the active filter
  const visibleTodos = useMemo(() => {
    return todos.filter(todo => {
      switch (filter) {
        case FilterStatus.Active:
          return !todo.completed;
        case FilterStatus.Completed:
          return todo.completed;
        default:
          return true;
      }
    });
  }, [todos, filter]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          onAdd={addTodo}
          isSubmitting={isSubmitting}
          inputRef={todoInputRef}
        />
        {/* Hide list and footer if there are no todos */}
        {(todos.length > 0 || tempTodo) && (
          <>
            <TodoList
              todos={visibleTodos}
              tempTodo={tempTodo}
              onDelete={onDeleteTodo}
              loadingIds={loadingIds}
            />
            <Footer
              currentFilter={filter}
              onFilterChange={setFilter}
              todos={todos}
              onClearCompleted={clearCompleted}
            />
          </>
        )}
      </div>
      <ErrorNotification
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </div>
  );
};
