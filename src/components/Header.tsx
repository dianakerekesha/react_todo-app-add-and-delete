import React, { useEffect, useState } from 'react';
interface Props {
  onAdd: (title: string) => Promise<void>;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}
export const Header: React.FC<Props> = ({ onAdd, isSubmitting, inputRef }) => {
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      await onAdd(currentTitle);

      setCurrentTitle('');
    } catch {}
  };

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
      />

      {/* Add a todo on form submit */}
      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={currentTitle}
          onChange={e => setCurrentTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </header>
  );
};
