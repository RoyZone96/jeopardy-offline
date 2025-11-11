import { useState, useEffect } from "react";

const STORAGE_KEY = "jeopardy_boards_v1";

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read boards from localStorage", e);
    return [];
  }
}

function writeRaw(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // storage event won't fire in same tab, but we update state locally
  } catch (e) {
    console.error("Failed to write boards to localStorage", e);
  }
}

export function getBoards() {
  return readRaw();
}

export function addBoard(board) {
  const list = readRaw();
  const newBoard = { ...board, id: Date.now().toString() };
  list.push(newBoard);
  writeRaw(list);
  return newBoard;
}

export function updateBoard(id, updates) {
  const list = readRaw();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeRaw(list);
  return list[idx];
}

// helpers for manipulating nested category/question data
function findBoardIndex(list, boardId) {
  return list.findIndex((b) => b.id === boardId);
}

function saveList(list) {
  writeRaw(list);
}

export function addCategory(
  boardId,
  category = { title: "Category", questions: [] },
  atIndex
) {
  console.log("localStorage.addCategory called", {
    boardId,
    category,
    atIndex,
  });
  const list = readRaw();
  const idx = findBoardIndex(list, boardId);
  if (idx === -1) return null;
  const board = { ...list[idx] };
  const newCat = { ...category };
  // assign id to category to support id-based updates
  if (!newCat.id) newCat.id = Date.now().toString();
  const cats = board.categories ? [...board.categories] : [];
  if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= cats.length) {
    cats.splice(atIndex, 0, newCat);
  } else {
    cats.push(newCat);
  }
  board.categories = cats;
  list[idx] = board;
  saveList(list);
  return board;
}

export function updateCategory(boardId, identifier, updates) {
  console.log("localStorage.updateCategory called", {
    boardId,
    identifier,
    updates,
  });
  const list = readRaw();
  const bIdx = findBoardIndex(list, boardId);
  if (bIdx === -1) return null;
  const board = { ...list[bIdx] };
  const cats = (board.categories || []).slice();
  let cIdx = -1;
  // if identifier is numeric index, allow expanding the categories array
  if (typeof identifier === "number") {
    cIdx = identifier;
    if (cIdx < 0) return null;
    // if categories array is too short, expand with default empty categories
    if (cIdx >= cats.length) {
      const needed = cIdx - cats.length + 1;
      const defaultCat = () => ({
        title: "Category",
        questions: Array.from({ length: 5 }).map((_, i) => ({
          value: (i + 1) * 100,
          question: "",
          answer: "",
          claimed: false,
        })),
      });
      for (let i = 0; i < needed; i++) cats.push(defaultCat());
    }
  } else {
    cIdx = cats.findIndex((c) => c.id === identifier);
    if (cIdx < 0) return null;
  }
  cats[cIdx] = { ...cats[cIdx], ...updates };
  board.categories = cats;
  list[bIdx] = board;
  saveList(list);
  console.log("localStorage.updateCategory -> saved board", board);
  return board;
}

export function removeCategory(boardId, identifier) {
  console.log("localStorage.removeCategory called", { boardId, identifier });
  const list = readRaw();
  const bIdx = findBoardIndex(list, boardId);
  if (bIdx === -1) return null;
  const board = { ...list[bIdx] };
  const cats = (board.categories || []).slice();
  let cIdx = -1;
  if (typeof identifier === "number") cIdx = identifier;
  else cIdx = cats.findIndex((c) => c.id === identifier);
  if (cIdx < 0 || cIdx >= cats.length) return null;
  cats.splice(cIdx, 1);
  board.categories = cats;
  list[bIdx] = board;
  saveList(list);
  console.log("localStorage.removeCategory -> saved board", board);
  return board;
}

export function addQuestion(
  boardId,
  categoryIdentifier,
  question = { value: 100, question: "", answer: "" },
  atIndex
) {
  console.log("localStorage.addQuestion called", {
    boardId,
    categoryIdentifier,
    question,
    atIndex,
  });
  const list = readRaw();
  const bIdx = findBoardIndex(list, boardId);
  if (bIdx === -1) return null;
  const board = { ...list[bIdx] };
  const cats = (board.categories || []).slice();
  let cIdx = -1;
  if (typeof categoryIdentifier === "number") cIdx = categoryIdentifier;
  else cIdx = cats.findIndex((c) => c.id === categoryIdentifier);
  if (cIdx < 0) return null;
  const cat = { ...cats[cIdx] };
  const qs = cat.questions ? [...cat.questions] : [];
  const newQ = { ...question };
  if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= qs.length)
    qs.splice(atIndex, 0, newQ);
  else qs.push(newQ);
  cat.questions = qs;
  cats[cIdx] = cat;
  board.categories = cats;
  list[bIdx] = board;
  saveList(list);
  return board;
}

export function updateQuestion(
  boardId,
  categoryIdentifier,
  questionIndex,
  updates
) {
  console.log("localStorage.updateQuestion called", {
    boardId,
    categoryIdentifier,
    questionIndex,
    updates,
  });
  const list = readRaw();
  const bIdx = findBoardIndex(list, boardId);
  if (bIdx === -1) return null;
  const board = { ...list[bIdx] };
  const cats = (board.categories || []).slice();
  let cIdx = -1;
  if (typeof categoryIdentifier === "number") cIdx = categoryIdentifier;
  else cIdx = cats.findIndex((c) => c.id === categoryIdentifier);
  if (cIdx < 0) return null;
  const cat = { ...cats[cIdx] };
  const qs = (cat.questions || []).slice();
  if (questionIndex < 0 || questionIndex >= qs.length) return null;
  qs[questionIndex] = { ...qs[questionIndex], ...updates };
  cat.questions = qs;
  cats[cIdx] = cat;
  board.categories = cats;
  list[bIdx] = board;
  saveList(list);
  console.log("localStorage.updateQuestion -> saved board", board);
  return board;
}

export function removeQuestion(boardId, categoryIdentifier, questionIndex) {
  console.log("localStorage.removeQuestion called", {
    boardId,
    categoryIdentifier,
    questionIndex,
  });
  const list = readRaw();
  const bIdx = findBoardIndex(list, boardId);
  if (bIdx === -1) return null;
  const board = { ...list[bIdx] };
  const cats = (board.categories || []).slice();
  let cIdx = -1;
  if (typeof categoryIdentifier === "number") cIdx = categoryIdentifier;
  else cIdx = cats.findIndex((c) => c.id === categoryIdentifier);
  if (cIdx < 0) return null;
  const cat = { ...cats[cIdx] };
  const qs = (cat.questions || []).slice();
  if (questionIndex < 0 || questionIndex >= qs.length) return null;
  qs.splice(questionIndex, 1);
  cat.questions = qs;
  cats[cIdx] = cat;
  board.categories = cats;
  list[bIdx] = board;
  saveList(list);
  console.log("localStorage.removeQuestion -> saved board", board);
  return board;
}

export function removeBoard(id) {
  const list = readRaw().filter((b) => b.id !== id);
  writeRaw(list);
}

export function clearBoards() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear boards", e);
  }
}

// React hook to keep boards in sync inside a single tab and across tabs (storage event)
export function useLocalBoards() {
  const [boards, setBoards] = useState(() => readRaw());

  useEffect(() => {
    function handleStorage(e) {
      if (!e.key || e.key === STORAGE_KEY) {
        setBoards(readRaw());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const add = (b) => {
    const newBoard = addBoard(b);
    setBoards(readRaw());
    return newBoard;
  };

  const update = (id, updates) => {
    const updated = updateBoard(id, updates);
    setBoards(readRaw());
    return updated;
  };

  const remove = (id) => {
    removeBoard(id);
    setBoards(readRaw());
  };

  const clear = () => {
    clearBoards();
    setBoards([]);
  };

  const addCategoryLocal = (boardId, category, atIndex) => {
    console.log("useLocalBoards.addCategoryLocal", {
      boardId,
      category,
      atIndex,
    });
    const updated = addCategory(boardId, category, atIndex);
    setBoards(readRaw());
    console.log("useLocalBoards.addCategoryLocal -> result", updated);
    return updated;
  };

  const updateCategoryLocal = (boardId, identifier, updates) => {
    console.log("useLocalBoards.updateCategoryLocal", {
      boardId,
      identifier,
      updates,
    });
    const updated = updateCategory(boardId, identifier, updates);
    setBoards(readRaw());
    console.log("useLocalBoards.updateCategoryLocal -> result", updated);
    return updated;
  };

  const removeCategoryLocal = (boardId, identifier) => {
    console.log("useLocalBoards.removeCategoryLocal", { boardId, identifier });
    const updated = removeCategory(boardId, identifier);
    setBoards(readRaw());
    console.log("useLocalBoards.removeCategoryLocal -> result", updated);
    return updated;
  };

  const addQuestionLocal = (boardId, categoryIdentifier, question, atIndex) => {
    console.log("useLocalBoards.addQuestionLocal", {
      boardId,
      categoryIdentifier,
      question,
      atIndex,
    });
    const updated = addQuestion(boardId, categoryIdentifier, question, atIndex);
    setBoards(readRaw());
    console.log("useLocalBoards.addQuestionLocal -> result", updated);
    return updated;
  };

  const updateQuestionLocal = (
    boardId,
    categoryIdentifier,
    questionIndex,
    updates
  ) => {
    console.log("useLocalBoards.updateQuestionLocal", {
      boardId,
      categoryIdentifier,
      questionIndex,
      updates,
    });
    const updated = updateQuestion(
      boardId,
      categoryIdentifier,
      questionIndex,
      updates
    );
    setBoards(readRaw());
    console.log("useLocalBoards.updateQuestionLocal -> result", updated);
    return updated;
  };

  const removeQuestionLocal = (boardId, categoryIdentifier, questionIndex) => {
    console.log("useLocalBoards.removeQuestionLocal", {
      boardId,
      categoryIdentifier,
      questionIndex,
    });
    const updated = removeQuestion(boardId, categoryIdentifier, questionIndex);
    setBoards(readRaw());
    console.log("useLocalBoards.removeQuestionLocal -> result", updated);
    return updated;
  };

  return {
    boards,
    add,
    update,
    remove,
    clear,
    addCategory: addCategoryLocal,
    updateCategory: updateCategoryLocal,
    removeCategory: removeCategoryLocal,
    addQuestion: addQuestionLocal,
    updateQuestion: updateQuestionLocal,
    removeQuestion: removeQuestionLocal,
  };
}

export default {
  getBoards,
  addBoard,
  updateBoard,
  removeBoard,
  clearBoards,
  useLocalBoards,
  addCategory,
  updateCategory,
  removeCategory,
  addQuestion,
  updateQuestion,
  removeQuestion,
};
