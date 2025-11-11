import React, { useMemo, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import PropTypes from "prop-types";
import { useLocalBoards } from "../../services/localStorage";
import "./Board.css";

/*
  Board component
  props:
    - mode: 'build' | 'play'  (default: 'play')
    - boardId: optional id of a saved board to load from localStorage
    - board: optional board object to use directly

  Board structure expected (flexible):
    {
      id,
      title,
      categories: [
        { title: 'Cat', questions: [ { value: 100, question: '', answer: '', claimed: false } ] }
      ]
    }

  This component uses reactstrap for layout and modals and the localStorage hook to persist changes.
*/

export default function Board({
  mode = "play",
  boardId,
  board: boardProp,
  onChange,
}) {
  const { boards, update, updateCategory, removeCategory } = useLocalBoards();
  const [localBoard, setLocalBoard] = useState(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [colIndex, setColIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(0);
  const [form, setForm] = useState({ question: "", answer: "", value: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [isDailyDouble, setIsDailyDouble] = useState(false);
  const [catTitle, setCatTitle] = useState("");
  const [isClaimed, setIsClaimed] = useState(false);
  const [categoryMenuIndex, setCategoryMenuIndex] = useState(null);

  // pick board: prop > boardId > first saved
  const board = useMemo(() => {
    if (boardProp) return boardProp;
    if (boardId) return boards.find((b) => b.id === boardId) || null;
    return boards[0] || null;
  }, [boards, boardId, boardProp]);

  useEffect(() => setLocalBoard(board), [board]);

  function ensureGrid(b) {
    // ensure categories and rows exist (default 5x5)
    if (!b) return b;
    let cols = b.categories && b.categories.length > 0 ? b.categories.slice() : [];
    // ensure we always show a 5-column board — fill missing categories with defaults
    const minCols = 5;
    if (cols.length < minCols) {
      const needed = minCols - cols.length;
      for (let i = 0; i < needed; i++) cols.push({ title: "Category", questions: [] });
    }
    // ensure each category has 5 question slots by default
    const normalized = {
      ...b,
      categories: cols.map((c) => ({
        title: c.title || "Category",
        questions: Array.from({ length: 5 }).map((_, i) => {
          const existing = (c.questions || [])[i];
          return existing
            ? existing
            : {
                value: (i + 1) * 100,
                question: "",
                answer: "",
                claimed: false,
              };
        }),
      })),
    };
    return normalized;
  }

  const view = localBoard ? ensureGrid(localBoard) : null;

  function openCell(cIdx, rIdx, isEditing = false) {
    if (!view) return;
    setColIndex(cIdx);
    setRowIndex(rIdx);
    const cell = (view.categories[cIdx].questions || [])[rIdx] || {
      question: "",
      answer: "",
      value: (rIdx + 1) * 100,
    };
    setForm({
      question: cell.question || "",
      answer: cell.answer || "",
      value: cell.value || (rIdx + 1) * 100,
    });
    setIsDailyDouble(Boolean(cell.dailyDouble));
    setIsClaimed(Boolean(cell.claimed));
    setEditing(isEditing);
    setShowAnswer(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function saveCell() {
    if (!view) return;
    const updated = { ...view };
    updated.categories = view.categories.map((c, ci) => ({
      ...c,
      questions: c.questions.map((q, qi) =>
        ci === colIndex && qi === rowIndex
          ? {
              ...q,
              question: form.question,
              answer: form.answer,
              // value is intentionally not overwritten here (values are fixed)
              dailyDouble: Boolean(isDailyDouble),
            }
          : q
      ),
    }));
    setLocalBoard(updated);
    if (typeof onChange === "function") onChange(updated);
    // persist
    try {
      update(updated.id, updated);
    } catch (e) {
      console.error("Failed to persist board update", e);
    }
    setOpen(false);
  }

  function claimCell() {
    // toggle claimed state for the currently-open cell
    if (!view) return;
    const updated = { ...view };
    updated.categories = view.categories.map((c, ci) => ({
      ...c,
      questions: c.questions.map((q, qi) =>
        ci === colIndex && qi === rowIndex ? { ...q, claimed: !q.claimed } : q
      ),
    }));
    setLocalBoard(updated);
    // reflect toggled state in modal
    setIsClaimed((s) => !s);
    if (typeof onChange === "function") onChange(updated);
    try {
      if (updated && updated.id) update(updated.id, updated);
    } catch (e) {
      console.error(e);
    }
    setOpen(false);
  }

  function resetBoard() {
    if (!view) return;
    // confirmation to avoid accidental resets
    if (!window.confirm("Reset all claimed marks on this board?")) return;
    const updated = { ...view };
    updated.categories = view.categories.map((c) => ({
      ...c,
      questions: (c.questions || []).map((q) => ({ ...q, claimed: false })),
    }));
    setLocalBoard(updated);
    if (typeof onChange === "function") onChange(updated);
    try {
      if (updated && updated.id) update(updated.id, updated);
    } catch (e) {
      console.error("Failed to persist resetBoard", e);
    }
  }

  if (!view)
    return (
      <Container style={{ padding: 12 }}>
        <h3>No board loaded</h3>
        <p>Create a board in Make Board or visit My Boards to select one.</p>
      </Container>
    );

  return (
    <Container style={{ padding: 12 }}>
          <Row>
            <Col>
              <h2>{view.title || "Untitled Board"}</h2>
            </Col>
            {mode === "play" && (
              <Col xs="auto" className="align-self-center">
                <Button color="warning" onClick={resetBoard}>
                  Reset Claims
                </Button>
              </Col>
            )}
          </Row>

      <Row>
        <Col>
          <Table
            bordered
            responsive
            className="jeopardy-board-table"
            style={{ tableLayout: "fixed" }}
          >
            <thead>
              <tr>
                {view.categories.map((cat, cIdx) => (
                  <th key={cIdx} className="category-header">
                    <div className="category-title">
                      {cat.title || `Category ${cIdx + 1}`}
                    </div>
                    {mode === "build" && (
                      <>
                        <div className="cat-edit">
                          <a
                            href="#"
                            className="edit-link"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingCatIndex(cIdx);
                              setCatTitle(cat.title || `Category ${cIdx + 1}`);
                              setCatOpen(true);
                            }}
                          >
                            Edit
                          </a>
                        </div>

                        {/* overflow menu button (for small screens) */}
                        <div className="cat-overflow">
                          <a
                            href="#"
                            className="overflow-trigger"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryMenuIndex(
                                categoryMenuIndex === cIdx ? null : cIdx
                              );
                            }}
                          >
                            ⋯
                          </a>

                          {categoryMenuIndex === cIdx && (
                            <div
                              className="cat-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href="#"
                                className="cat-menu-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEditingCatIndex(cIdx);
                                  setCatTitle(
                                    cat.title || `Category ${cIdx + 1}`
                                  );
                                  setCatOpen(true);
                                  setCategoryMenuIndex(null);
                                }}
                              >
                                Edit
                              </a>
                              <a
                                href="#"
                                className="cat-menu-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // prefer granular remove when board is saved
                                  if (view && view.id) {
                                    try {
                                      const res = removeCategory(view.id, cIdx);
                                      if (res) {
                                        setLocalBoard(res);
                                        if (typeof onChange === "function")
                                          onChange(res);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  } else {
                                    const updated = { ...view };
                                    updated.categories = view.categories.filter(
                                      (_, idx) => idx !== cIdx
                                    );
                                    setLocalBoard(updated);
                                    if (typeof onChange === "function")
                                      onChange(updated);
                                  }
                                  setCategoryMenuIndex(null);
                                }}
                              >
                                Remove
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: view.categories[0].questions.length }).map(
                (_, rIdx) => (
                  <tr key={rIdx}>
                    {view.categories.map((cat, cIdx) => {
                      const cell = (cat.questions || [])[rIdx] || {
                        value: (rIdx + 1) * 100,
                      };
                      const claimed = cell.claimed;
                      const daily = Boolean(cell.dailyDouble);
                      return (
                        <td
                          key={cIdx}
                          className={[
                            "cell",
                            claimed ? "claimed" : "",
                            daily ? "daily-double" : "",
                          ].join(" ")}
                          onClick={() =>
                            mode === "play"
                              ? openCell(cIdx, rIdx, false)
                              : openCell(cIdx, rIdx, true)
                          }
                        >
                          <div className="cell-value">
                            {cell.value || (rIdx + 1) * 100}
                          </div>
                          {mode === "build" && (
                            <div className="cell-edit">
                              <a
                                href="#"
                                className="edit-link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openCell(cIdx, rIdx, true);
                                }}
                              >
                                Edit
                              </a>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal for viewing/editing a cell */}
      <Modal isOpen={open} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          {mode === "build" || editing ? "Edit Question" : "Question"}
        </ModalHeader>
        <ModalBody>
          {mode === "build" || editing ? (
            <Form>
              <FormGroup>
                <Label for="value">Value</Label>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  {form.value || (rowIndex + 1) * 100}
                </div>
              </FormGroup>

              <FormGroup>
                <Label for="question">Question</Label>
                <Input
                  id="question"
                  type="textarea"
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label for="answer">Answer</Label>
                <Input
                  id="answer"
                  type="textarea"
                  value={form.answer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, answer: e.target.value }))
                  }
                />
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={isDailyDouble}
                    onChange={(e) => setIsDailyDouble(e.target.checked)}
                  />{" "}
                  Daily Double
                </Label>
              </FormGroup>
            </Form>
          ) : (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {form.question}
              </div>
              <div>
                {showAnswer ? (
                  <div
                    style={{ marginTop: 12, background: "#f7f7f7", padding: 8 }}
                  >
                    {form.answer}
                  </div>
                ) : (
                  <Button color="primary" onClick={() => setShowAnswer(true)}>
                    Show Answer
                  </Button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {mode === "build" || editing ? (
            <>
              <Button color="primary" onClick={saveCell}>
                Save
              </Button>{" "}
              <Button color="secondary" onClick={closeModal}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button color={isClaimed ? "danger" : "success"} onClick={claimCell}>
                {isClaimed ? "Unmark Claimed" : "Mark Claimed"}
              </Button>{" "}
              <Button color="secondary" onClick={closeModal}>
                Close
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      {/* Modal for editing category title */}
      <Modal isOpen={catOpen} toggle={() => setCatOpen(false)}>
        <ModalHeader toggle={() => setCatOpen(false)}>
          Edit Category
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="catTitle">Title</Label>
              <Input
                id="catTitle"
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              if (editingCatIndex == null) return setCatOpen(false);
              const updated = { ...view };
              // if the board is saved, prefer granular category update
              if (updated && updated.id) {
                try {
                  console.log("Board: calling updateCategory", {
                    id: updated.id,
                    editingCatIndex,
                    catTitle,
                  });
                  const res = updateCategory(updated.id, editingCatIndex, {
                    title: catTitle,
                  });
                  console.log("Board: updateCategory returned", res);
                  if (res) {
                    setLocalBoard(res);
                    if (typeof onChange === "function") {
                      console.log(
                        "Board: calling onChange with updated board from updateCategory"
                      );
                      onChange(res);
                    }
                  }
                } catch (err) {
                  console.error(err);
                }
              } else {
                updated.categories = view.categories.map((c, idx) =>
                  idx === editingCatIndex ? { ...c, title: catTitle } : c
                );
                setLocalBoard(updated);
                if (typeof onChange === "function") onChange(updated);
              }
              setCatOpen(false);
            }}
          >
            Save
          </Button>{" "}
          <Button
            color="danger"
            onClick={() => {
              if (editingCatIndex == null) return setCatOpen(false);
              const updated = { ...view };
              // if saved, prefer granular remove
              if (updated && updated.id) {
                try {
                  console.log("Board: calling removeCategory", {
                    id: updated.id,
                    editingCatIndex,
                  });
                  const res = removeCategory(updated.id, editingCatIndex);
                  console.log("Board: removeCategory returned", res);
                  if (res) {
                    setLocalBoard(res);
                    if (typeof onChange === "function") {
                      console.log(
                        "Board: calling onChange with updated board from removeCategory"
                      );
                      onChange(res);
                    }
                  }
                } catch (err) {
                  console.error(err);
                }
              } else {
                updated.categories = view.categories.filter(
                  (_, idx) => idx !== editingCatIndex
                );
                setLocalBoard(updated);
                if (typeof onChange === "function") onChange(updated);
              }
              setCatOpen(false);
            }}
          >
            Remove
          </Button>{" "}
          <Button color="secondary" onClick={() => setCatOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

Board.propTypes = {
  mode: PropTypes.oneOf(["play", "build"]),
  boardId: PropTypes.string,
  board: PropTypes.object,
};
